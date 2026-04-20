import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

type TemplateId = "classic" | "modern" | "elegant" | "minimal" | "bold";

type Experience = {
  id: string;
  company: string;
  role: string;
  dates: string;
  desc: string;
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  dates: string;
  grade: string;
};

type Project = {
  id: string;
  name: string;
  link: string;
  dates: string;
  desc: string;
};

type Skill = {
  name: string;
  level: number;
};

type CoverState = {
  manager: string;
  company: string;
  jobtitle: string;
  opening: string;
  why: string;
  strengths: string;
  closing: string;
};

type ResumeState = {
  template: TemplateId;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo: string; // data URL
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
};

type AtsResult = {
  score: number;
  label: string;
  color: string;
  sub: string;
  found: string[];
  missing: string[];
};

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadSessionJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function persistSessionJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const RF_STATE_KEY = "rf_state_v2";
const COVER_STATE_KEY = "rf_cover_state_v2";

const DEFAULT_STATE: ResumeState = {
  template: "classic",
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  photo: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

const DEFAULT_COVER: CoverState = {
  manager: "",
  company: "",
  jobtitle: "",
  opening: "",
  why: "",
  strengths: "",
  closing: "",
};

const stopWords = new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "is",
  "are",
  "be",
  "will",
  "we",
  "you",
  "our",
  "your",
  "this",
  "that",
  "have",
  "has",
  "can",
  "as",
  "from",
  "by",
  "it",
  "its",
  "they",
  "their",
  "all",
  "not",
  "but",
  "was",
  "were",
  "been",
  "would",
  "should",
  "could",
  "who",
  "which",
  "what",
  "when",
  "how",
  "more",
  "also",
  "any",
  "other",
  "into",
  "than",
  "about",
  "up",
  "do",
  "did",
  "if",
  "so",
  "no",
  "my",
  "we",
  "he",
  "she",
  "him",
  "her",
  "his",
  "them",
  "us",
  "me",
  "these",
  "those",
  "such",
  "each",
  "both",
  "either",
]);

function extractJdWords(jd: string): string[] {
  const normalized = jd.toLowerCase();
  const matches = normalized.match(/\b[a-z][a-z0-9+#.-]{1,30}\b/g) || [];
  const unique = [...new Set(matches)];
  return unique.filter((w) => !stopWords.has(w) && w.length > 2);
}

function runAtsScoring(state: ResumeState, jd: string): AtsResult {
  const s = state;

  const resumeText = [
    s.name,
    s.title,
    s.summary,
    ...s.experience.map((e) => e.role + " " + e.company + " " + e.desc),
    ...s.education.map((e) => e.degree + " " + e.institution),
    ...s.skills.map((sk) => sk.name),
    ...s.projects.map((p) => p.name + " " + p.desc),
  ]
    .join(" ")
    .toLowerCase();

  const jdWords = extractJdWords(jd);

  const found: string[] = [];
  const missing: string[] = [];

  for (const word of jdWords) {
    if (resumeText.includes(word)) found.push(word);
    else missing.push(word);
  }

  const total = jdWords.length || 1;
  const pct = Math.round((found.length / total) * 100);

  let bonus = 0;
  if (s.summary) bonus += 5;
  if (s.experience.length) bonus += 5;
  if (s.skills.length >= 3) bonus += 5;

  const score = Math.min(100, pct + bonus);

  let label: string;
  let color: string;
  let sub: string;

  if (score >= 75) {
    label = "Strong match";
    color = "#6dffa0";
    sub = "Your resume aligns well with this job description. Good chance of passing ATS filters.";
  } else if (score >= 50) {
    label = "Moderate match";
    color = "#f7c948";
    sub = "Decent match but room to improve. Try adding the missing keywords naturally into your resume.";
  } else if (score >= 25) {
    label = "Weak match";
    color = "#f09433";
    sub = "Your resume is missing several key terms. Tailor it more closely to this job description.";
  } else {
    label = "Poor match";
    color = "#ff6b6b";
    sub = "Very few keywords match. Consider rewriting your summary and experience to reflect this role.";
  }

  return {
    score,
    label,
    color,
    sub,
    found,
    missing,
  };
}

function joinContact(items: string[]) {
  return items.filter(Boolean);
}

function ResumePaper({
  state,
}: {
  state: ResumeState;
}) {
  const contacts = joinContact([state.email, state.phone, state.location, state.website].filter(Boolean));
  const skills = state.skills;
  const exp = state.experience;
  const edu = state.education;
  const proj = state.projects;

  if (state.template === "modern") {
    return (
      <div className="resume-paper tpl-modern w-[210mm] min-h-[297mm] bg-white">
        <div className="flex flex-row">
          <div className="w-[72mm] flex-shrink-0 bg-slate-800 p-[36px_24px]">
            {state.photo ? (
              <img
                src={state.photo}
                className="mx-auto mb-4 h-[72px] w-[72px] rounded-full border-[2px] border-sky-400 object-cover"
                alt="profile"
              />
            ) : null}
            <div className="text-[22px] font-bold text-white leading-tight">{state.name || "Your Name"}</div>
            <div className="mt-1 text-[11px] font-normal text-slate-300 uppercase tracking-w-[0.05em]">
              {state.title || "Your Title"}
            </div>

            <div className="mt-6 space-y-4">
              {contacts.length ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 border-b border-slate-700 pb-2 mb-2">
                    Contact
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 break-all">
                    {contacts.map((c) => (
                      <div key={c}>{c}</div>
                    ))}
                  </div>
                </div>
              ) : null}

              {skills.length ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 border-b border-slate-700 pb-2 mb-2">
                    Skills
                  </div>
                  <div className="space-y-3">
                    {skills.map((sk) => (
                      <div key={sk.name}>
                        <div className="text-[11px] text-slate-200 mb-1">{sk.name}</div>
                        <div className="h-[3px] rounded bg-slate-700 overflow-hidden">
                          <div className="h-full bg-sky-400" style={{ width: `${sk.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-w-0 p-[36px_28px] bg-white">
            {state.summary ? (
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-sky-400 pb-2 mb-3">
                  About
                </div>
                <div className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{state.summary}</div>
              </div>
            ) : null}

            {exp.length ? (
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-sky-400 pb-2 mb-3">
                  Experience
                </div>
                {exp.map((e) => (
                  <div key={e.id} className="mb-4">
                    <div className="flex justify-between">
                      <div className="text-[13px] font-semibold text-slate-800">{e.role}</div>
                      <div className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-3 whitespace-nowrap">
                        {e.dates}
                      </div>
                    </div>
                    {e.company ? <div className="text-[11px] text-sky-500 mt-1">{e.company}</div> : null}
                    {e.desc ? <div className="text-[11px] text-slate-500 leading-relaxed mt-2 whitespace-pre-wrap">{e.desc}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {edu.length ? (
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-sky-400 pb-2 mb-3">
                  Education
                </div>
                {edu.map((ed) => (
                  <div key={ed.id} className="mb-4">
                    <div className="flex justify-between">
                      <div className="text-[13px] font-semibold text-slate-800">{ed.degree}</div>
                      <div className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-3 whitespace-nowrap">
                        {ed.dates}
                      </div>
                    </div>
                    {ed.institution ? <div className="text-[11px] text-sky-500 mt-1">{ed.institution}</div> : null}
                    {ed.grade ? <div className="text-[11px] text-slate-500 mt-1">{ed.grade}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {proj.length ? (
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-sky-400 pb-2 mb-3">
                  Projects
                </div>
                {proj.map((p) => (
                  <div key={p.id} className="mb-4">
                    <div className="flex justify-between">
                      <div className="text-[13px] font-semibold text-slate-800">{p.name}</div>
                      {p.dates ? (
                        <div className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-3 whitespace-nowrap">
                          {p.dates}
                        </div>
                      ) : null}
                    </div>
                    {p.link ? <div className="text-[11px] text-sky-500 mt-1 break-all">{p.link}</div> : null}
                    {p.desc ? <div className="text-[11px] text-slate-500 leading-relaxed mt-2 whitespace-pre-wrap">{p.desc}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // For the remaining templates, we render with simpler Tailwind structures.
  const templateHeader =
    state.template === "bold" ? (
      <div className="bg-black text-white px-11 py-9 rounded-t-[16px] -mx-[1px] -mt-[1px]">
        <div className="w-full h-[4px] bg-red-500 mb-4" />
        <div className="font-sans text-[48px] tracking-wide leading-[1] font-normal">{state.name || "Your Name"}</div>
        <div className="text-[12px] tracking-[0.18em] uppercase text-red-400 mt-2 mb-5 font-medium">
          {state.title || "Your Title"}
        </div>
      </div>
    ) : null;

  const header = (
    <div
      className={
        state.template === "elegant"
          ? "text-center px-10 pt-10 pb-6"
          : state.template === "minimal"
            ? "px-12 pt-10 pb-8"
            : "px-12 pt-10 pb-6"
      }
    >
      {state.template === "elegant" ? (
        <div className="relative">
          <div className="absolute left-12 right-12 top-0 h-[1px] bg-yellow-700" />
          <div className="font-serif uppercase tracking-[2px] text-[28px] font-semibold text-black">
            {state.name || "Your Name"}
          </div>
          <div className="text-[12px] font-medium italic tracking-[0.2em] uppercase text-yellow-900 mt-2">
            {state.title || "Your Title"}
          </div>
          {contacts.length ? (
            <div className="mt-3 text-[11px] text-yellow-800/80 flex justify-center flex-wrap gap-4">
              {contacts.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-1">
          {state.template !== "bold" ? (
            <div className="text-[34px] font-semibold text-slate-900 leading-tight">{state.name || "Your Name"}</div>
          ) : null}
          <div className="text-[13px] uppercase tracking-[0.15em] text-slate-600/90 font-medium">
            {state.title || "Role / Title"}
          </div>
          {contacts.length ? (
            <div className="mt-2 text-[12px] text-slate-700/90 flex flex-wrap gap-3">
              {contacts.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const skillsBlock =
    skills.length ? (
      <div className="flex flex-wrap gap-2">
        {skills.map((sk) => (
          <span key={sk.name} className="inline-flex items-center rounded-full border border-slate-900/20 bg-slate-100 px-3 py-1 text-[11px] text-slate-700">
            {sk.name}
          </span>
        ))}
      </div>
    ) : (
      <div className="text-slate-500 text-sm">Add skills</div>
    );

  const main = (
    <div className={state.template === "minimal" ? "px-12 py-8" : "px-12 py-8"}>
      {state.summary ? (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.15em] text-slate-900 border-b border-slate-900/30 pb-2 mb-3">
            Profile
          </div>
          <div className="text-[13px] leading-relaxed text-slate-800/80 whitespace-pre-wrap">{state.summary}</div>
        </div>
      ) : null}

      {exp.length ? (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.15em] text-slate-900 border-b border-slate-900/30 pb-2 mb-3">
            Experience
          </div>
          <div className="space-y-4">
            {exp.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between gap-3">
                  <div className="font-semibold text-slate-900 text-[14px]">{e.role}</div>
                  {e.dates ? <div className="text-[11px] text-slate-500 whitespace-nowrap">{e.dates}</div> : null}
                </div>
                {e.company ? <div className="text-[12px] font-semibold italic text-slate-700 mt-1">{e.company}</div> : null}
                {e.desc ? <div className="text-[12px] leading-relaxed text-slate-700/90 mt-2 whitespace-pre-wrap">{e.desc}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {edu.length ? (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.15em] text-slate-900 border-b border-slate-900/30 pb-2 mb-3">
            Education
          </div>
          <div className="space-y-4">
            {edu.map((ed) => (
              <div key={ed.id}>
                <div className="flex justify-between gap-3">
                  <div className="font-semibold text-slate-900 text-[14px]">{ed.degree}</div>
                  {ed.dates ? <div className="text-[11px] text-slate-500 whitespace-nowrap">{ed.dates}</div> : null}
                </div>
                {ed.institution ? <div className="text-[12px] text-slate-700 mt-1">{ed.institution}</div> : null}
                {ed.grade ? <div className="text-[11px] text-slate-500 mt-1">{ed.grade}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {proj.length ? (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.15em] text-slate-900 border-b border-slate-900/30 pb-2 mb-3">
            Projects
          </div>
          <div className="space-y-4">
            {proj.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between gap-3">
                  <div className="font-semibold text-slate-900 text-[14px]">{p.name}</div>
                  {p.dates ? <div className="text-[11px] text-slate-500 whitespace-nowrap">{p.dates}</div> : null}
                </div>
                {p.link ? <div className="text-[12px] text-slate-700 mt-1 break-all">{p.link}</div> : null}
                {p.desc ? <div className="text-[12px] leading-relaxed text-slate-700/90 mt-2 whitespace-pre-wrap">{p.desc}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {skills.length ? (
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-slate-900 border-b border-slate-900/30 pb-2 mb-3">
            Skills
          </div>
          {skillsBlock}
        </div>
      ) : null}
    </div>
  );

  // Minimal vs other templates use different wrapper backgrounds.
  const bg =
    state.template === "bold"
      ? "bg-white border border-black/10 rounded-[16px]"
      : "bg-white border border-black/10 rounded-[16px]";

  return (
    <div className={`${bg} w-[210mm] min-h-[297mm] bg-white overflow-hidden`}>
      {state.template === "bold" ? templateHeader : header}
      {state.template === "bold" ? <div className="px-12 pt-8 pb-10">{main}</div> : main}
    </div>
  );
}

function CoverLetterPreview({ state, cover }: { state: ResumeState; cover: CoverState }) {
  const contacts = joinContact([state.email, state.phone, state.location, state.website].filter(Boolean));
  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const nameVal = state.name || "Your Name";
  const titleVal = state.title;
  const recipientName = cover.manager || "Hiring Manager";
  const companyHtml = cover.company;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white border border-black/10 rounded-[16px] p-[52px_56px]">
      <div className="mb-9">
        <div className="text-[22px] font-bold text-black">{nameVal}</div>
        {titleVal ? <div className="text-[12px] text-slate-600 italic">{titleVal}</div> : null}
        {contacts.length ? <div className="text-[11px] text-slate-600 flex flex-wrap gap-4 mt-2">{contacts.join(" · ")}</div> : null}
      </div>

      <div className="text-[12px] text-slate-700">
        <div className="mb-3">{today}</div>
        <div className="mb-3">
          <div className="font-semibold">{recipientName}</div>
          {companyHtml ? <div>{companyHtml}</div> : null}
        </div>

        <div className="font-semibold mb-3">
          Re: Application for {cover.jobtitle || cover.company || "the position"}
        </div>

        <div className="mb-4 whitespace-pre-wrap leading-relaxed text-[13px] text-slate-800">
          {cover.opening ||
            "Introduce yourself and mention the role you're applying for…"}
        </div>
        {cover.why ? (
          <div className="mb-4 whitespace-pre-wrap leading-relaxed text-[13px] text-slate-800">
            {cover.why}
          </div>
        ) : null}
        {cover.strengths ? (
          <div className="mb-4 whitespace-pre-wrap leading-relaxed text-[13px] text-slate-800">
            {cover.strengths}
          </div>
        ) : null}
        {cover.closing ? (
          <div className="whitespace-pre-wrap leading-relaxed text-[13px] text-slate-800">
            {cover.closing}
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed text-[13px] text-slate-800">
            Thank them, express enthusiasm, mention availability…
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-3">Sincerely,</div>
        <div className="text-[14px] font-semibold">{nameVal}</div>
        {titleVal ? <div className="text-[12px] text-slate-600">{titleVal}</div> : null}
      </div>
    </div>
  );
}

export default function ResumeBuilderV2() {
  const [state, setState] = useState<ResumeState>(() => {
    const loaded = loadSessionJson<ResumeState>(RF_STATE_KEY);
    return loaded ? { ...DEFAULT_STATE, ...loaded } : DEFAULT_STATE;
  });
  const [cover, setCover] = useState<CoverState>(() => {
    const loaded = loadSessionJson<CoverState>(COVER_STATE_KEY);
    return loaded ? { ...DEFAULT_COVER, ...loaded } : DEFAULT_COVER;
  });

  const [activeSection, setActiveSection] = useState<
    "basics" | "summary" | "experience" | "education" | "skills" | "projects" | "cover" | "ats"
  >("basics");

  const [previewFlash, setPreviewFlash] = useState(false);
  const signature = useMemo(() => JSON.stringify({ state, cover, activeSection }), [state, cover, activeSection]);

  const [skillInput, setSkillInput] = useState("");

  const [jd, setJd] = useState("");
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const start = window.setTimeout(() => setPreviewFlash(true), 0);
    const stop = window.setTimeout(() => setPreviewFlash(false), 260);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [signature]);

  // Persist in sessionStorage
  useEffect(() => {
    const t = window.setTimeout(() => {
      persistSessionJson(RF_STATE_KEY, state);
      persistSessionJson(COVER_STATE_KEY, cover);
    }, 200);
    return () => clearTimeout(t);
  }, [state, cover]);

  const update = <K extends keyof ResumeState>(key: K, value: ResumeState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const updateExperience = (id: string, patch: Partial<Experience>) => {
    setState((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const updateEducation = (id: string, patch: Partial<Education>) => {
    setState((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const addExperience = () => {
    const e: Experience = { id: uid(), company: "", role: "", dates: "", desc: "" };
    setState((prev) => ({ ...prev, experience: [...prev.experience, e] }));
  };

  const addEducation = () => {
    const e: Education = { id: uid(), institution: "", degree: "", dates: "", grade: "" };
    setState((prev) => ({ ...prev, education: [...prev.education, e] }));
  };

  const addProject = () => {
    const p: Project = { id: uid(), name: "", link: "", dates: "", desc: "" };
    setState((prev) => ({ ...prev, projects: [...prev.projects, p] }));
  };

  const duplicateExperience = (id: string) => {
    const orig = state.experience.find((e) => e.id === id);
    if (!orig) return;
    const copy: Experience = { ...orig, id: uid() };
    const idx = state.experience.findIndex((e) => e.id === id);
    setState((prev) => {
      const next = [...prev.experience];
      next.splice(idx + 1, 0, copy);
      return { ...prev, experience: next };
    });
  };

  const duplicateEducation = (id: string) => {
    const orig = state.education.find((e) => e.id === id);
    if (!orig) return;
    const copy: Education = { ...orig, id: uid() };
    const idx = state.education.findIndex((e) => e.id === id);
    setState((prev) => {
      const next = [...prev.education];
      next.splice(idx + 1, 0, copy);
      return { ...prev, education: next };
    });
  };

  const duplicateProject = (id: string) => {
    const orig = state.projects.find((p) => p.id === id);
    if (!orig) return;
    const copy: Project = { ...orig, id: uid() };
    const idx = state.projects.findIndex((p) => p.id === id);
    setState((prev) => {
      const next = [...prev.projects];
      next.splice(idx + 1, 0, copy);
      return { ...prev, projects: next };
    });
  };

  const removeExperience = (id: string) => {
    setState((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  };

  const removeEducation = (id: string) => {
    setState((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  };

  const removeProject = (id: string) => {
    setState((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    const parts = val.split(",");
    setState((prev) => {
      const next = [...prev.skills];
      for (const raw of parts) {
        const t = raw.trim();
        if (!t) continue;
        if (next.find((k) => k.name === t)) continue;
        next.push({ name: t, level: 75 });
      }
      return { ...prev, skills: next };
    });
    setSkillInput("");
  };

  const removeSkill = (name: string) => {
    setState((prev) => ({ ...prev, skills: prev.skills.filter((k) => k.name !== name) }));
  };

  const setSkillLevel = (name: string, level: number) => {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.map((sk) => (sk.name === name ? { ...sk, level } : sk)),
    }));
  };

  const onPickPhoto = async (file: File | null) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Photo must be under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setState((prev) => ({ ...prev, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearAll = () => {
    if (!confirm("Clear all resume data?")) return;
    setState(DEFAULT_STATE);
    setCover(DEFAULT_COVER);
    setAtsResult(null);
    setJd("");
    sessionStorage.removeItem(RF_STATE_KEY);
    sessionStorage.removeItem(COVER_STATE_KEY);
    toast.success("Cleared resume data.");
  };

  const downloadPdf = () => {
    // We replicate “Download PDF” UX using print-to-PDF.
    window.setTimeout(() => window.print(), 50);
  };

  const analyse = () => {
    if (!jd.trim()) {
      toast.error("Paste Job Description first.");
      return;
    }
    const result = runAtsScoring(state, jd);
    setAtsResult(result);
  };

  const resumeOrCover = activeSection === "cover";

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>


        <div className="relative z-[2] mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-10">
          <div className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Resume builder</h1>
              <p className="mt-1 text-sm text-slate-400">
                Session-based resume editor with 5 templates, cover letter, and ATS scoring.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadPdf}
                className="btn-glow-primary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="btn-glow-secondary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
            <div className="no-print rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                    Template
                  </h2>
                  <span className="text-[11px] text-slate-500">Switch layout & styling</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "classic", label: "Classic" },
                      { id: "modern", label: "Modern" },
                      { id: "elegant", label: "Elegant" },
                      { id: "minimal", label: "Minimal" },
                      { id: "bold", label: "Bold" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update("template", t.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        state.template === t.id
                          ? "border-[#6C63FF]/50 bg-[#6C63FF]/20 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["basics", "Basics"],
                    ["summary", "Summary"],
                    ["experience", "Experience"],
                    ["education", "Education"],
                    ["skills", "Skills"],
                    ["projects", "Projects"],
                    ["cover", "Cover letter"],
                    ["ats", "ATS score"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveSection(key)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      activeSection === key
                        ? "border-[#00D4FF]/40 bg-[#00D4FF]/15 text-white shadow-[0_0_26px_rgba(0,212,255,0.12)]"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-4">
                {activeSection === "basics" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Full name
                        </label>
                        <input
                          value={state.name}
                          onChange={(e) => update("name", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="e.g. Arjun Sharma"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Professional title
                        </label>
                        <input
                          value={state.title}
                          onChange={(e) => update("title", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="e.g. Software Engineer"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Email
                        </label>
                        <input
                          value={state.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="you@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Phone
                        </label>
                        <input
                          value={state.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="+977 98XXXXXXXX"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Location
                        </label>
                        <input
                          value={state.location}
                          onChange={(e) => update("location", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="Kathmandu, Nepal"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Website / LinkedIn
                        </label>
                        <input
                          value={state.website}
                          onChange={(e) => update("website", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="linkedin.com/in/you"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Profile photo (optional)
                        </label>
                        {state.photo ? (
                          <button
                            type="button"
                            onClick={() => update("photo", "")}
                            className="rounded-xl border border-white/10 px-3 py-2 text-[11px] font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                          >
                            Remove photo
                          </button>
                        ) : null}
                      </div>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="mt-3 block w-full text-sm text-slate-400"
                        onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                      />
                      {state.photo ? (
                        <img
                          src={state.photo}
                          alt="thumb"
                          className="mt-3 h-16 w-16 rounded-full border border-sky-300/30 object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {activeSection === "summary" ? (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                      Professional summary
                    </label>
                    <textarea
                      value={state.summary}
                      onChange={(e) => update("summary", e.target.value)}
                      rows={6}
                      className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      placeholder="Write 2–3 sentences about your experience, what you do best, and what you're looking for…"
                    />
                  </div>
                ) : null}

                {activeSection === "experience" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                        Experience
                      </h3>
                      <button
                        type="button"
                        onClick={addExperience}
                        className="btn-glow-secondary rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        + Add Experience
                      </button>
                    </div>

                    {state.experience.length ? (
                      <div className="space-y-4">
                        {state.experience.map((e, i) => (
                          <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: i * 0.03 }}
                            className="rounded-2xl border border-white/10 bg-black/25 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                  Experience {i + 1}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => duplicateExperience(e.id)}
                                  className="rounded-xl border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:border-white/20 hover:text-white transition"
                                  aria-label="Duplicate experience"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExperience(e.id)}
                                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200 hover:border-rose-500/35 transition"
                                  aria-label="Remove experience"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Company
                                </label>
                                <input
                                  value={e.company}
                                  onChange={(ev) => updateExperience(e.id, { company: ev.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="Company name"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Role / Position
                                </label>
                                <input
                                  value={e.role}
                                  onChange={(ev) => updateExperience(e.id, { role: ev.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="Job title"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                Dates
                              </label>
                              <input
                                value={e.dates}
                                onChange={(ev) => updateExperience(e.id, { dates: ev.target.value })}
                                className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="Jan 2022 – Present"
                              />
                            </div>

                            <div className="mt-4">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                Description
                              </label>
                              <textarea
                                value={e.desc}
                                onChange={(ev) => updateExperience(e.id, { desc: ev.target.value })}
                                rows={3}
                                className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="Describe your responsibilities and achievements…"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add experience to see it in preview.</p>
                    )}
                  </div>
                ) : null}

                {activeSection === "education" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                        Education
                      </h3>
                      <button
                        type="button"
                        onClick={addEducation}
                        className="btn-glow-secondary rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        + Add Education
                      </button>
                    </div>

                    {state.education.length ? (
                      <div className="space-y-4">
                        {state.education.map((ed, i) => (
                          <motion.div
                            key={ed.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: i * 0.03 }}
                            className="rounded-2xl border border-white/10 bg-black/25 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Education {i + 1}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => duplicateEducation(ed.id)}
                                  className="rounded-xl border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:border-white/20 hover:text-white transition"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeEducation(ed.id)}
                                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200 hover:border-rose-500/35 transition"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 mt-4">
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Institution
                                </label>
                                <input
                                  value={ed.institution}
                                  onChange={(ev) => updateEducation(ed.id, { institution: ev.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="University / College"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Degree / Program
                                </label>
                                <input
                                  value={ed.degree}
                                  onChange={(ev) => updateEducation(ed.id, { degree: ev.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="e.g. B.Tech Computer Science"
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Dates
                                </label>
                                <input
                                  value={ed.dates}
                                  onChange={(ev) => updateEducation(ed.id, { dates: ev.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="2020 – 2024"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Grade / GPA
                                </label>
                                <input
                                  value={ed.grade}
                                  onChange={(ev) => updateEducation(ed.id, { grade: ev.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="3.8 GPA / 85%"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add education to see it in preview.</p>
                    )}
                  </div>
                ) : null}

                {activeSection === "skills" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                        Skills
                      </label>
                      <div className="mt-3 flex gap-2">
                        <input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          placeholder="e.g. Python, Figma, MS Word…"
                          className="w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                        />
                        <button type="button" onClick={addSkill} className="btn-glow-secondary rounded-xl px-3 py-3 text-sm font-semibold">
                          Add
                        </button>
                      </div>
                    </div>

                    {state.skills.length ? (
                      <div className="space-y-3">
                        {state.skills.map((sk) => (
                          <div key={sk.name} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">{sk.name}</p>
                                <p className="text-[11px] text-slate-500 mt-1">{sk.level}%</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSkill(sk.name)}
                                className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200 hover:border-rose-500/35 transition"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="mt-3">
                              <input
                                type="range"
                                min={10}
                                max={100}
                                step={5}
                                value={sk.level}
                                onChange={(e) => setSkillLevel(sk.name, Number(e.target.value))}
                                className="w-full accent-purple-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add a few skills to improve ATS score.</p>
                    )}
                  </div>
                ) : null}

                {activeSection === "projects" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                        Projects
                      </h3>
                      <button
                        type="button"
                        onClick={addProject}
                        className="btn-glow-secondary rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        + Add Project
                      </button>
                    </div>
                    {state.projects.length ? (
                      <div className="space-y-4">
                        {state.projects.map((p, i) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: i * 0.03 }}
                            className="rounded-2xl border border-white/10 bg-black/25 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Project {i + 1}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => duplicateProject(p.id)}
                                  className="rounded-xl border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:border-white/20 hover:text-white transition"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeProject(p.id)}
                                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200 hover:border-rose-500/35 transition"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Project name
                                </label>
                                <input
                                  value={p.name}
                                  onChange={(e) => updateProject(p.id, { name: e.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="e.g. Nexivo Clone"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                  Link (optional)
                                </label>
                                <input
                                  value={p.link}
                                  onChange={(e) => updateProject(p.id, { link: e.target.value })}
                                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                  placeholder="github.com/you/project"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                Dates
                              </label>
                              <input
                                value={p.dates}
                                onChange={(e) => updateProject(p.id, { dates: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="Mar 2024"
                              />
                            </div>

                            <div className="mt-4">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]">
                                Description
                              </label>
                              <textarea
                                value={p.desc}
                                onChange={(e) => updateProject(p.id, { desc: e.target.value })}
                                rows={3}
                                className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="What did you build and what impact did it have?"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add projects to see them in preview.</p>
                    )}
                  </div>
                ) : null}

                {activeSection === "cover" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Hiring manager name (optional)
                        </label>
                        <input
                          value={cover.manager}
                          onChange={(e) => setCover((prev) => ({ ...prev, manager: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="e.g. Ms. Sarah Johnson"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          Company name
                        </label>
                        <input
                          value={cover.company}
                          onChange={(e) => setCover((prev) => ({ ...prev, company: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                          placeholder="Company"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                        Job title applying for
                      </label>
                      <input
                        value={cover.jobtitle}
                        onChange={(e) => setCover((prev) => ({ ...prev, jobtitle: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>

                    {(
                      [
                        ["opening", "Opening paragraph"],
                        ["why", "Why this company?"],
                        ["strengths", "Your strengths / key skills"],
                        ["closing", "Closing paragraph"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                          {label}
                        </label>
                        <textarea
                          value={cover[key]}
                          onChange={(e) => setCover((prev) => ({ ...prev, [key]: e.target.value }))}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                        />
                      </div>
                    ))}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-slate-400">
                      Cover letter preview uses your Basics fields (name, title, contacts).
                    </div>
                  </div>
                ) : null}

                {activeSection === "ats" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                        Paste job description
                      </label>
                      <textarea
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        rows={8}
                        className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                        placeholder="Paste the job description here and Nexivo will score your ATS alignment…"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={analyse}
                      className="btn-glow-primary w-full rounded-xl px-4 py-3 text-sm font-semibold"
                    >
                      Analyse my resume
                    </button>

                    {atsResult ? (
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                          <div
                            className="h-[92px] w-[92px] rounded-full border-4 flex flex-col items-center justify-center"
                            style={{
                              borderColor: atsResult.color,
                              background: atsResult.color + "18",
                            }}
                          >
                            <div className="text-[28px] font-bold font-mono text-slate-800">{atsResult.score}</div>
                            <div className="text-[10px] text-slate-700 font-semibold">/ 100</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-[15px] font-semibold" style={{ color: atsResult.color }}>
                              {atsResult.label}
                            </div>
                            <div className="text-sm text-slate-200 mt-1">{atsResult.sub}</div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Keywords found in your resume
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(atsResult.found || []).slice(0, 30).map((w) => (
                                <span
                                  key={w}
                                  className="rounded-full border px-3 py-1 text-[11px]"
                                  style={{
                                    borderColor: "rgba(109,255,160,0.3)",
                                    background: "rgba(109,255,160,0.1)",
                                    color: "#6dffa0",
                                  }}
                                >
                                  {w}
                                </span>
                              ))}
                              {atsResult.found.length === 0 ? (
                                <span className="text-sm text-slate-500">None found</span>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Missing keywords
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(atsResult.missing || []).slice(0, 30).map((w) => (
                                <span
                                  key={w}
                                  className="rounded-full border px-3 py-1 text-[11px]"
                                  style={{
                                    borderColor: "rgba(255,107,107,0.3)",
                                    background: "rgba(255,107,107,0.1)",
                                    color: "#ff6b6b",
                                  }}
                                >
                                  {w}
                                </span>
                              ))}
                              {atsResult.missing.length === 0 ? (
                                <span className="text-sm text-slate-500">None — great job!</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                        Click <span className="text-[#00D4FF] font-semibold">Analyse my resume</span> to see ATS insights.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="relative">
              <div
                className="no-print rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm mb-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                    Preview
                  </h2>
                  <span className="text-[11px] text-slate-500">Updates in real time</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div
                  className="resume-preview-wrap rounded-2xl"
                  style={{
                    filter: previewFlash ? "brightness(1.05)" : "brightness(1)",
                    boxShadow: previewFlash
                      ? "0 0 0 1px rgba(0,212,255,0.35), 0 0 38px rgba(108,99,255,0.18)"
                      : "0 0 40px rgba(108,99,255,0.08)",
                  }}
                >
                  {resumeOrCover ? <CoverLetterPreview state={state} cover={cover} /> : <ResumePaper state={state} />}
                </div>
              </div>

              <style>{`
                @media print {
                  body { background: #fff !important; }
                  .no-print { display: none !important; }
                  .dashboard-sidebar { display: none !important; }
                  .dashboard-topbar { display: none !important; }
                  .resume-preview-wrap { box-shadow: none !important; border: none !important; }
                  .resume-preview-wrap * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              `}</style>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
}

