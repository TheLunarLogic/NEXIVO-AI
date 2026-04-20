import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { createDocumentChatApi } from "../components/documentChat/documentChatApi";

type JsonRecord = Record<string, unknown>;

interface CurriculumItem {
  week: number;
  topics: string[];
  concepts: string[];
  project: string;
}

interface Resource {
  title: string;
  type: string;
  cost: string;
  url: string;
  estimated_time: string;
  description: string;
  difficulty: string;
  format: string;
}

interface ResourceGroup {
  week: number;
  resources: Resource[];
}

interface RoadmapData {
  curriculum: CurriculumItem[];
  resources: Record<string, ResourceGroup>;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toWeek(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return fallback;
}

function normalizeResource(value: unknown): Resource | null {
  if (!isRecord(value)) return null;

  const title = toText(value.title || value.name || value.resource_title);
  if (!title) return null;

  const type = toText(value.type || value.category, "resource");
  const format = toText(
    value.format || value.media_type,
    type.toLowerCase() === "video" ? "video" : "text",
  );

  return {
    title,
    type,
    cost: toText(value.cost || value.price, "Free"),
    url: toText(value.url || value.link),
    estimated_time: toText(
      value.estimated_time || value.estimatedTime || value.duration || value.time_to_complete,
    ),
    description: toText(value.description || value.summary),
    difficulty: toText(value.difficulty || value.level),
    format,
  };
}

function normalizeResourceGroup(value: unknown, fallbackWeek: number): ResourceGroup | null {
  if (!isRecord(value)) return null;

  const week = toWeek(value.week || value.week_number || value.id, fallbackWeek);
  const rawResources = value.resources || value.items || value.links || value.recommendations;

  let resources = Array.isArray(rawResources)
    ? rawResources.map(normalizeResource).filter((item): item is Resource => item !== null)
    : [];

  if (resources.length === 0) {
    const singleResource = normalizeResource(value);
    if (singleResource) resources = [singleResource];
  }

  if (resources.length === 0) return null;

  return {
    week,
    resources,
  };
}

function normalizeCurriculumItem(value: unknown, fallbackWeek: number): CurriculumItem | null {
  if (!isRecord(value)) return null;

  const week = toWeek(value.week || value.week_number || value.id, fallbackWeek);
  if (week <= 0) return null;

  return {
    week,
    topics: toStringList(value.topics || value.focus || value.modules),
    concepts: toStringList(value.concepts || value.skills || value.outcomes),
    project: toText(
      value.project || value.project_name || value.assignment,
      "Apply this week's learning in a small practical exercise.",
    ),
  };
}

function buildResourceMap(value: unknown): Record<string, ResourceGroup> {
  const groups: ResourceGroup[] = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const group = normalizeResourceGroup(item, index + 1);
      if (group) groups.push(group);
    });
  } else if (isRecord(value)) {
    if ("resources" in value || "week" in value) {
      const group = normalizeResourceGroup(value, 1);
      if (group) groups.push(group);
    } else {
      Object.entries(value).forEach(([key, item], index) => {
        const group = normalizeResourceGroup(item, toWeek(key, index + 1));
        if (group) groups.push(group);
      });
    }
  }

  return groups.reduce<Record<string, ResourceGroup>>((acc, group) => {
    acc[String(group.week)] = group;
    return acc;
  }, {});
}

function normalizeRoadmapResponse(payload: unknown): RoadmapData {
  const root = isRecord(payload) ? payload : null;

  const curriculumSource =
    root?.curriculum || root?.roadmap || root?.weeks || (Array.isArray(payload) ? payload : null);
  const curriculum = Array.isArray(curriculumSource)
    ? curriculumSource
        .map((item, index) => normalizeCurriculumItem(item, index + 1))
        .filter((item): item is CurriculumItem => item !== null)
    : [];

  const resourcesSource =
    root?.resources ||
    root?.weekly_resources ||
    root?.resource_map ||
    (root && "week" in root ? root : null);
  const resources = buildResourceMap(resourcesSource);

  if (curriculum.length > 0) {
    return { curriculum, resources };
  }

  const derivedCurriculum = Object.values(resources)
    .sort((a, b) => a.week - b.week)
    .map((group) => ({
      week: group.week,
      topics: group.resources.map((item) => item.title).slice(0, 3),
      concepts: [],
      project: "Review the recommended resources and build one small milestone for this week.",
    }));

  return {
    curriculum: derivedCurriculum,
    resources,
  };
}

const Roadmap = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
  const api = useRef(createDocumentChatApi(API_URL)).current;

  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast.error("Please enter a learning goal");
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const response = await api.generateRoadmap(goal);
      const normalized = normalizeRoadmapResponse(response);
      const hasContent =
        normalized.curriculum.length > 0 || Object.keys(normalized.resources).length > 0;

      if (!hasContent) {
        throw new Error("Roadmap response did not contain usable content.");
      }

      setData(normalized);
      setExpandedWeek(normalized.curriculum[0]?.week ?? null);
      toast.success("Roadmap generated successfully!");
    } catch (error) {
      toast.error("Failed to generate roadmap.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="relative z-[1] mx-auto max-w-5xl pb-12">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Roadmap with Resources
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Get a step-by-step roadmap for any skill with curated resources and videos.
            </p>
          </div>

          <div className="neon-glass-panel mb-10 rounded-2xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. Learn Full Stack Web Development in 3 months"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#6C63FF]/50"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="btn-glow-primary rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Roadmap"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF]" />
                  <p className="text-sm italic text-slate-400">
                    Crafting your personalized roadmap...
                  </p>
                </div>
              ) : data && data.curriculum.length > 0 ? (
                <div className="space-y-6">
                  {data.curriculum.map((item) => {
                    const weekResources = data.resources[String(item.week)];

                    return (
                      <div
                        key={item.week}
                        className={`neon-glass-panel rounded-2xl transition-all duration-300 ${
                          expandedWeek === item.week
                            ? "bg-white/[0.05] ring-1 ring-[#6C63FF]/40"
                            : "opacity-80"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWeek(expandedWeek === item.week ? null : item.week)
                          }
                          className="flex w-full items-center justify-between p-6 text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D4FF]/20 bg-[#00D4FF]/10 font-mono text-sm font-bold text-[#00D4FF]">
                              W{item.week}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                                Week {item.week}
                              </h3>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.topics.length > 0
                                  ? item.topics.join(" | ")
                                  : "Recommended learning focus"}
                              </p>
                            </div>
                          </div>
                          <svg
                            className={`h-5 w-5 text-slate-500 transition-transform ${
                              expandedWeek === item.week ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        <AnimatePresence>
                          {expandedWeek === item.week && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-6 border-t border-white/10 p-6 pt-2">
                                <div>
                                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C63FF]/80">
                                    Concepts to Master
                                  </h4>
                                  {item.concepts.length > 0 ? (
                                    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                      {item.concepts.map((concept, index) => (
                                        <li
                                          key={`${item.week}-${index}`}
                                          className="flex items-start gap-2 text-xs text-slate-300"
                                        >
                                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C63FF]/60" />
                                          {concept}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-slate-500">
                                      No concept list came back for this week, but the roadmap stays
                                      visible and the resources are still available below.
                                    </p>
                                  )}
                                </div>

                                <div className="rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/10 p-4">
                                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C63FF]">
                                    Weekly Project
                                  </h4>
                                  <p className="text-xs leading-relaxed text-slate-200">
                                    {item.project}
                                  </p>
                                </div>

                                {weekResources && (
                                  <div>
                                    <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D4FF]/80">
                                      Recommended Resources
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                      {weekResources.resources.map((resource, index) => (
                                        <a
                                          key={`${item.week}-resource-${index}`}
                                          href={resource.url || undefined}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="group flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-[#6C63FF]/30 hover:bg-white/[0.06]"
                                        >
                                          <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 text-[9px] font-bold tracking-wide text-slate-300">
                                                {resource.format.toLowerCase() === "video"
                                                  ? "VID"
                                                  : "DOC"}
                                              </div>
                                              <div>
                                                <h5 className="text-sm font-semibold text-white transition-colors group-hover:text-[#6C63FF]">
                                                  {resource.title}
                                                </h5>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400">
                                                    {resource.cost}
                                                  </span>
                                                  {resource.estimated_time && (
                                                    <span className="text-[10px] text-slate-500">
                                                      {resource.estimated_time}
                                                    </span>
                                                  )}
                                                  {resource.difficulty && (
                                                    <span className="text-[10px] capitalize text-slate-500">
                                                      Level: {resource.difficulty}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <svg
                                              className="h-4 w-4 text-slate-600 transition-colors group-hover:text-white"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                              />
                                            </svg>
                                          </div>
                                          {resource.description && (
                                            <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                                              {resource.description}
                                            </p>
                                          )}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold tracking-[0.3em] text-slate-500">
                    ROADMAP
                  </div>
                  <h3 className="text-sm font-semibold text-slate-400">
                    Ready to start your journey?
                  </h3>
                  <p className="mt-2 max-w-xs text-xs text-slate-600">
                    Enter your learning goal above and our AI will generate a tailored curriculum
                    with curated resources.
                  </p>
                </div>
              )}
            </div>

            <aside className="hidden space-y-6 lg:block">
              <div className="neon-glass-panel rounded-2xl border-l-4 border-l-[#00D4FF] p-5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Why Roadmap?
                </h4>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  A structured path reduces decision fatigue and helps you stay focused on what
                  truly matters to reach your goals faster.
                </p>
              </div>

              <div className="neon-glass-panel rounded-2xl border-l-4 border-l-[#6C63FF] p-5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Community Choice
                </h4>
                <div className="mt-4 space-y-3">
                  {["React Native", "Machine Learning", "System Design"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setGoal(tag)}
                      className="block w-full py-1 text-left text-[11px] text-slate-500 transition-colors hover:text-white"
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default Roadmap;
