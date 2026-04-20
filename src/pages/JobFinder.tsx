import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

type Job = {
  id: string;
  company: string;
  role: string;
  location: string;
  experience: string;
  match: number;
  tags: string[];
  blurb: string;
  link?: string;
  matchReason?: string;
  similarityScore?: number;
  salary?: string | null;
  requirements?: string[];
  benefits?: string[];
  companyInfo?: {
    size?: string | null;
    industry?: string | null;
    website?: string | null;
  };
  description?: string;
};

const JOBS: Job[] = [
  {
    id: "j1",
    company: "NexaStack",
    role: "Frontend Developer",
    location: "Bengaluru",
    experience: "0-2",
    match: 92,
    tags: ["React", "TypeScript", "Tailwind"],
    blurb:
      "Build responsive student-facing dashboards with modern React and design systems.",
    description:
      "Build responsive student-facing dashboards with modern React and design systems.",
  },
  {
    id: "j2",
    company: "CloudSprint Labs",
    role: "Software Engineer Intern",
    location: "Remote",
    experience: "Intern",
    match: 88,
    tags: ["JavaScript", "Node", "API"],
    blurb:
      "Ship product features with mentorship, code reviews, and rapid iteration cycles.",
    description:
      "Ship product features with mentorship, code reviews, and rapid iteration cycles.",
  },
  {
    id: "j3",
    company: "Datapath AI",
    role: "Full Stack Engineer",
    location: "Hyderabad",
    experience: "3-5",
    match: 76,
    tags: ["React", "Python", "Postgres"],
    blurb:
      "Own full-stack modules from schema design to deployment and observability.",
    description:
      "Own full-stack modules from schema design to deployment and observability.",
  },
  {
    id: "j4",
    company: "Orbit Careers",
    role: "Backend Developer",
    location: "Pune",
    experience: "0-2",
    match: 72,
    tags: ["Node", "SQL", "Redis"],
    blurb:
      "Design robust APIs and optimize service performance for high request volumes.",
    description:
      "Design robust APIs and optimize service performance for high request volumes.",
  },
  {
    id: "j5",
    company: "Aether Systems",
    role: "Senior Frontend Engineer",
    location: "Remote",
    experience: "5+",
    match: 64,
    tags: ["React", "Architecture", "Performance"],
    blurb:
      "Lead frontend architecture decisions and mentor a growing UI engineering team.",
    description:
      "Lead frontend architecture decisions and mentor a growing UI engineering team.",
  },
];

const PAGE_SIZE = 5;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
const API_URL = `${BACKEND_URL}/jobs/find_jobs`;
const JOBFINDER_SESSION_KEY = "nexivo_jobfinder_cache_v1";

function toPercent(n: unknown): number {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return 0;
  // Common patterns: 0..1 or 0..100
  const pct = num <= 1 ? num * 100 : num;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function mapExperienceLevel(exp: string): string | null {
  // Backend expects: Entry Level / Mid Level / Senior Level
  if (!exp || exp === "All") return null;
  if (exp === "Intern" || exp === "0-2") return "Entry Level";
  if (exp === "3-5") return "Mid Level";
  if (exp === "5+") return "Senior Level";
  return null;
}

function normalizeTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t)).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeJob(raw: unknown, idx: number): Job {
  const r = (
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  ) as Record<string, unknown>;

  const asStr = (v: unknown) =>
    v === null || v === undefined ? "" : String(v);

  const roleTitle =
    asStr(r["title"] ?? r["role"] ?? r["job_title"] ?? r["position"]) || "Role";
  const role = roleTitle;
  const company =
    asStr(r["company"] ?? r["company_name"] ?? r["org"]) || "Company";
  const location =
    asStr(r["location"] ?? r["location_name"] ?? r["city"]) || "Location";
  const experience =
    asStr(
      r["experience_level"] ?? r["experience"] ?? r["level"] ?? r["seniority"],
    ) || "Experience";

  const similarityRaw =
    r["similarity_score"] ?? r["similarityScore"] ?? r["similarity"];
  const similarityScore =
    typeof similarityRaw === "number"
      ? similarityRaw
      : similarityRaw
        ? Number(similarityRaw)
        : undefined;

  const match = toPercent(
    r["match_score"] ??
      r["matchScore"] ??
      r["match"] ??
      r["score"] ??
      similarityScore,
  );

  const description = asStr(
    r["description"] ??
      r["blurb"] ??
      r["summary"] ??
      r["snippet"] ??
      r["details"] ??
      r["job_description"],
  );

  const blurb =
    description.length > 220
      ? `${description.slice(0, 220)}…`
      : description || "Job description not provided.";

  const link =
    asStr(r["link"] ?? r["apply_link"] ?? r["applyUrl"] ?? r["url"]) ||
    undefined;
  const matchReason = asStr(r["match_reason"] ?? r["matchReason"]) || undefined;

  const salaryRaw = r["salary"];
  const salary =
    salaryRaw === null || salaryRaw === undefined
      ? null
      : typeof salaryRaw === "string"
        ? salaryRaw
        : String(salaryRaw);

  const requirementsRaw = r["requirements"];
  const requirements = Array.isArray(requirementsRaw)
    ? requirementsRaw.map((x) => asStr(x)).filter(Boolean)
    : normalizeTags(requirementsRaw);

  const benefitsRaw = r["benefits"];
  const benefits = Array.isArray(benefitsRaw)
    ? benefitsRaw.map((x) => asStr(x)).filter(Boolean)
    : normalizeTags(benefitsRaw);

  const companyInfoRaw = r["company_info"];
  const companyInfo =
    companyInfoRaw && typeof companyInfoRaw === "object"
      ? {
          size:
            asStr((companyInfoRaw as Record<string, unknown>)["size"]) || null,
          industry:
            asStr((companyInfoRaw as Record<string, unknown>)["industry"]) ||
            null,
          website:
            asStr((companyInfoRaw as Record<string, unknown>)["website"]) ||
            null,
        }
      : undefined;

  const id = asStr(r["id"] ?? r["_id"] ?? `${company}-${role}-${idx}`);

  return {
    id,
    company,
    role,
    location,
    experience,
    match,
    tags: normalizeTags(
      r["tags"] ?? r["skills"] ?? r["keywords"] ?? requirements,
    ),
    blurb,
    description,
    link,
    matchReason,
    similarityScore,
    salary,
    requirements,
    benefits,
    companyInfo,
  };
}

function extractJobs(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const p = payload as Record<string, unknown>;

  // Some backends may return a single job object (not an array)
  if (
    typeof p["title"] === "string" ||
    typeof p["link"] === "string" ||
    typeof p["description"] === "string"
  ) {
    return [payload];
  }

  if (Array.isArray(p["jobs"])) return p["jobs"];
  if (Array.isArray(p["results"])) return p["results"];
  if (Array.isArray(p["data"])) return p["data"];

  const data = p["data"];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d["jobs"])) return d["jobs"];
    if (Array.isArray(d["results"])) return d["results"];
    if (Array.isArray(d["data"])) return d["data"];
  }

  return [];
}

function buildFallbackJobs(filters: {
  role: string;
  location: string;
  experience: string;
}): Job[] {
  const { role, location, experience } = filters;
  return JOBS.filter((job) => {
    const roleOk = !role || job.role.toLowerCase().includes(role.toLowerCase());
    const locationOk =
      !location || job.location.toLowerCase().includes(location.toLowerCase());
    const expOk = experience === "All" || job.experience === experience;
    return roleOk && locationOk && expOk;
  }).sort((a, b) => b.match - a.match);
}

const JobFinder = () => {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("All");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDragOver, setResumeDragOver] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const [didSearch, setDidSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);

  const persistJobs = useCallback(
    (jobs: Job[], nextPage: number, searched: boolean) => {
      try {
        sessionStorage.setItem(
          JOBFINDER_SESSION_KEY,
          JSON.stringify({
            jobs,
            page: nextPage,
            didSearch: searched,
            ts: Date.now(),
          }),
        );
      } catch {
        // ignore storage errors
      }
    },
    [],
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(JOBFINDER_SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        jobs?: unknown;
        page?: unknown;
        didSearch?: unknown;
      };
      if (Array.isArray(parsed.jobs)) {
        const restored: Job[] = (parsed.jobs as unknown[]).map((j, idx) =>
          normalizeJob(j, idx),
        );
        setAllJobs(restored);
        setDidSearch(parsed.didSearch === true);
        setPage(typeof parsed.page === "number" ? parsed.page : 0);
      }
    } catch {
      // ignore restore errors
    }
  }, []);

  useEffect(() => {
    if (!didSearch || loading) return;
    if (allJobs.length === 0) return;
    persistJobs(allJobs, page, true);
  }, [didSearch, allJobs, page, persistJobs, loading]);

  const visibleJobs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return allJobs.slice(start, start + PAGE_SIZE);
  }, [allJobs, page]);

  const hasPrev = page > 0;
  const hasNext = (page + 1) * PAGE_SIZE < allJobs.length;

  const handleFindJobs = useCallback(async () => {
    setDidSearch(true);
    setLoading(true);
    setError(null);
    setPage(0);

    const formData = new FormData();
    if (resumeFile) formData.append("resume", resumeFile, resumeFile.name);

    const cleanRole = role.trim();
    const cleanLocation = location.trim();
    const expLevel = mapExperienceLevel(experience);

    if (cleanRole) formData.append("role", cleanRole);
    if (cleanLocation) formData.append("location", cleanLocation);
    if (expLevel) formData.append("experience_level", expLevel);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Request failed: HTTP ${res.status}`);
      }

      const payload = await res.json();
      const items = extractJobs(payload);
      const normalized = items.map((j, idx) => normalizeJob(j, idx));
      setAllJobs(normalized);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(`Could not fetch jobs (${msg}). Showing demo results.`);
      setAllJobs(
        buildFallbackJobs({
          role: role.trim(),
          location: location.trim(),
          experience,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [experience, location, role, resumeFile]);

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="relative z-[1]">


          <div className="relative z-[2] mb-8 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Job finder
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Filter by role, location, and experience to discover opportunities
              with AI-style match scores.
            </p>
          </div>

          <div className="relative z-[2] grid gap-6 lg:grid-cols-[300px_1fr]">
            <section className="neon-glass-panel rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                Filters
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <label
                      className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                      htmlFor="resume-upload"
                    >
                      Resume (optional)
                    </label>
                    {resumeFile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResumeFile(null);
                          if (resumeInputRef.current)
                            resumeInputRef.current.value = "";
                        }}
                        className="rounded-xl border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition hover:border-white/20 hover:text-white"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <input
                    ref={resumeInputRef}
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setResumeFile(f);
                    }}
                  />

                  {resumeFile ? (
                    <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-sm font-semibold text-white truncate">
                        {resumeFile.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Attached for demo matching (+6 match boost)
                      </p>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload resume by dragging and dropping"
                      onClick={() => resumeInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          resumeInputRef.current?.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setResumeDragOver(true);
                      }}
                      onDragLeave={() => setResumeDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setResumeDragOver(false);
                        const f = e.dataTransfer.files?.[0] ?? null;
                        setResumeFile(f);
                      }}
                      className={`mt-2 flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-4 text-center transition ${
                        resumeDragOver
                          ? "border-[#00D4FF]/60 bg-[#00D4FF]/10"
                          : "border-white/15 bg-white/[0.03] hover:border-white/25"
                      }`}
                    >
                      <div className="text-xl" aria-hidden>
                        ⤓
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Drag & drop resume
                      </p>
                      <p className="text-[11px] text-slate-500">
                        or click to browse (PDF/DOC/TXT)
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="job-role"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Role
                  </label>
                  <input
                    id="job-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend, Intern"
                    className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                  />
                </div>

                <div>
                  <label
                    htmlFor="job-location"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Location
                  </label>
                  <input
                    id="job-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, Bengaluru"
                    className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                  />
                </div>

                <div>
                  <label
                    htmlFor="job-exp"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Experience
                  </label>
                  <select
                    id="job-exp"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-[#6C63FF]/45"
                  >
                    <option value="All" className="bg-slate-900">
                      All
                    </option>
                    <option value="Intern" className="bg-slate-900">
                      Intern
                    </option>
                    <option value="0-2" className="bg-slate-900">
                      0-2 years
                    </option>
                    <option value="3-5" className="bg-slate-900">
                      3-5 years
                    </option>
                    <option value="5+" className="bg-slate-900">
                      5+ years
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleFindJobs}
                  className="btn-glow-primary w-full rounded-xl py-2.5 text-sm font-semibold"
                >
                  Find jobs
                </button>
              </div>
            </section>

            <section className="relative space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Job matches
                </h2>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-400">
                  {!didSearch
                    ? "0 results"
                    : loading
                      ? "Searching…"
                      : `${allJobs.length} results`}
                </span>
              </div>

              {!didSearch ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center text-sm text-slate-500">
                  Click{" "}
                  <span className="text-[#00D4FF] font-semibold">
                    Find jobs
                  </span>{" "}
                  to see matches.
                </div>
              ) : loading ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center text-sm text-slate-500">
                  Finding roles for your resume…
                </div>
              ) : allJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center text-sm text-slate-500">
                  {error ? error : "No jobs match these filters."}
                </div>
              ) : (
                <>
                  {error ? (
                    <p className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-5 py-3 text-sm text-rose-200">
                      {error}
                    </p>
                  ) : null}
                  <div className="space-y-4">
                    {visibleJobs.map((job, idx) => (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        state={{ job }}
                        className="block"
                        aria-label={`Open details for ${job.role}`}
                      >
                        <motion.article
                          className="job-card-expand rounded-2xl border border-white/12 bg-black/30 p-5 backdrop-blur-sm"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: idx * 0.06 }}
                          whileHover={{
                            y: -4,
                            scale: 1.01,
                            borderColor: "rgba(0,212,255,0.35)",
                            boxShadow:
                              "0 0 0 1px rgba(108,99,255,0.35), 0 16px 38px rgba(0,0,0,0.35)",
                          }}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {job.role}
                              </h3>
                              <p className="mt-1 text-sm text-slate-400">
                                {job.company} · {job.location} ·{" "}
                                {job.experience}
                              </p>
                            </div>
                            <div className="rounded-xl border border-[#00D4FF]/35 bg-[#00D4FF]/10 px-3 py-2 text-right">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7AE9FF]">
                                Match score
                              </p>
                              <p className="font-mono text-lg font-bold text-white">
                                {job.match}%
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-slate-300">
                            {job.blurb}
                          </p>

                          {job.tags.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {job.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </motion.article>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={!hasPrev}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous 5
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNext}
                      className="btn-glow-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next 5
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default JobFinder;
