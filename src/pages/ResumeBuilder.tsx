import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import {
  type ResumeEducation,
  type ResumeExperience,
  type ResumeForm,
  ResumeTemplatePreview,
} from "../components/resume/ResumeTemplatePreview";

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}

function formatSkills(skillsText: string): string[] {
  return skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildResumeHtml(form: ResumeForm): string {
  const skills = formatSkills(form.skillsText);
  const safe = (v: string) => escapeHtml(v || "");

  const experiencesHtml =
    form.experiences.length > 0
      ? form.experiences
          .map((e) => {
            const desc = e.description.trim()
              ? `<p class="desc">${safe(e.description)}</p>`
              : `<p class="desc muted">Add a short responsibility / achievement.</p>`;
            return `<div class="item">
              <div class="roleLine">
                <span class="role">${safe(e.role || "Role")}</span>
                <span class="at"> @ ${safe(e.company || "Company")}</span>
              </div>
              <div class="meta">${safe(e.start || "Start")} — ${safe(e.end || "End")}</div>
              ${desc}
            </div>`;
          })
          .join("\n")
      : `<p class="muted">Add experience to see it here.</p>`;

  const educationHtml =
    form.educations.length > 0
      ? form.educations
          .map((ed) => {
            return `<div class="item">
              <div class="roleLine">
                <span class="role">${safe(ed.degree || "Degree")}</span>
              </div>
              <div class="meta">${safe(ed.school || "School")}</div>
              <div class="meta muted">${safe(ed.start || "Start")} — ${safe(ed.end || "End")}</div>
            </div>`;
          })
          .join("\n")
      : `<p class="muted">Add education to see it here.</p>`;

  const skillsHtml =
    skills.length > 0
      ? skills.map((s) => `<span class="chip">${safe(s)}</span>`).join("\n")
      : `<span class="muted">Add skills (comma-separated)</span>`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safe(form.name || "Resume")}</title>
    <style>
      body { margin: 0; padding: 24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background: #0b1220; color: #e5e7eb; }
      .paper { max-width: 920px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 28px; }
      .top h1 { margin: 0; font-size: 28px; line-height: 1.15; color: #fff; font-weight: 800; }
      .top .title { margin-top: 6px; color: #7ae9ff; font-weight: 700; }
      .contact { margin-top: 12px; font-size: 12px; color: rgba(226,232,240,0.78); display: flex; flex-wrap: wrap; gap: 12px; }
      .grid { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 20px; margin-top: 18px; }
      .box { border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; }
      .sectionHead { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #6c63ff; font-weight: 800; }
      .summary { margin-top: 10px; color: rgba(226,232,240,0.95); white-space: pre-wrap; }
      .chip { display: inline-block; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); padding: 6px 10px; border-radius: 999px; margin: 6px 8px 0 0; font-size: 12px; }
      .muted { color: rgba(148,163,184,0.9); }
      .item { padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); margin-top: 10px; }
      .roleLine { font-weight: 800; color: #fff; font-size: 14px; }
      .at { color: rgba(148,163,184,0.9); font-weight: 700; }
      .meta { font-size: 12px; color: rgba(226,232,240,0.75); margin-top: 4px; }
      .desc { margin-top: 10px; white-space: pre-wrap; }
      @media print { body { background: #fff; } .paper { background: #fff; border-color: #e5e7eb; color: #111827; } .top .title { color: #111827; } .sectionHead { color: #111827; } .chip { color: #111827; border-color: #e5e7eb; } .box, .item { background: #fff; } }
    </style>
  </head>
  <body>
    <div class="paper">
      <div class="top">
        <h1>${safe(form.name || "Your Name")}</h1>
        <div class="title">${safe(form.title || "Role / Title")}</div>
        <div class="contact">
          <span><b>Email:</b> ${safe(form.email || "you@email.com")}</span>
          <span><b>Phone:</b> ${safe(form.phone || "+1 (555) 123-4567")}</span>
          <span><b>Location:</b> ${safe(form.location || "City, Country")}</span>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <div class="sectionHead">Skills</div>
          <div style="margin-top: 12px;">${skillsHtml}</div>
          <div class="sectionHead" style="margin-top: 18px;">Summary</div>
          <div class="summary">${form.summary.trim() ? safe(form.summary) : `<span class="muted">A short summary that shows what you do and what you’re looking for.</span>`}</div>
        </div>
        <div class="box">
          <div class="sectionHead">Experience</div>
          <div>${experiencesHtml}</div>
          <div class="sectionHead" style="margin-top: 18px;">Education</div>
          <div>${educationHtml}</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

const ResumeBuilder = () => {
  const [form, setForm] = useState<ResumeForm>(() => {
    const initialExp: ResumeExperience = {
      id: newId(),
      company: "",
      role: "",
      start: "",
      end: "",
      description: "",
    };
    const initialEd: ResumeEducation = {
      id: newId(),
      school: "",
      degree: "",
      start: "",
      end: "",
    };
    return {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      skillsText: "",
      experiences: [initialExp],
      educations: [initialEd],
    };
  });

  const signature = useMemo(() => JSON.stringify(form), [form]);
  const [previewFlash, setPreviewFlash] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setPreviewFlash(true), 0);
    const stop = window.setTimeout(() => setPreviewFlash(false), 260);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [signature]);

  const update = (patch: Partial<ResumeForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const updateExperience = (id: string, patch: Partial<ResumeExperience>) => {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const updateEducation = (id: string, patch: Partial<ResumeEducation>) => {
    setForm((prev) => ({
      ...prev,
      educations: prev.educations.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const addExperience = () => {
    const e: ResumeExperience = {
      id: newId(),
      company: "",
      role: "",
      start: "",
      end: "",
      description: "",
    };
    setForm((prev) => ({ ...prev, experiences: [...prev.experiences, e] }));
  };

  const removeExperience = (id: string) => {
    setForm((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  };

  const addEducation = () => {
    const ed: ResumeEducation = {
      id: newId(),
      school: "",
      degree: "",
      start: "",
      end: "",
    };
    setForm((prev) => ({ ...prev, educations: [...prev.educations, ed] }));
  };

  const removeEducation = (id: string) => {
    setForm((prev) => ({ ...prev, educations: prev.educations.filter((e) => e.id !== id) }));
  };

  const onDownload = () => {
    if (!form.name.trim()) {
      toast.error("Add your name to download your resume.");
      return;
    }

    try {
      const html = buildResumeHtml(form);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = form.name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      a.href = url;
      a.download = `nexivo-resume_${safeName || "student"}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded as HTML.");
    } catch {
      toast.error("Could not generate download. Try again.");
    }
  };

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


          <div className="relative z-[2] mb-8 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Resume builder</h1>
            <p className="mt-1 text-sm text-slate-400">
              Fill the form on the left, and see your resume update live on the right.
            </p>
          </div>

          <div className="relative z-[2] grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
            <div className="space-y-6">
              <div className="neon-glass-panel rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                      Details
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Demo fields. Connect to an API if you want real parsing / ATS formatting.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onDownload}
                    className="btn-glow-primary rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    Download
                  </button>
                </div>

                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-name">
                      Name
                    </label>
                    <input
                      id="r-name"
                      value={form.name}
                      onChange={(e) => update({ name: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      placeholder="e.g. Namantalwar"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-title">
                      Title
                    </label>
                    <input
                      id="r-title"
                      value={form.title}
                      onChange={(e) => update({ title: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      placeholder="e.g. Frontend Developer / CS Student"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-email">
                        Email
                      </label>
                      <input
                        id="r-email"
                        value={form.email}
                        onChange={(e) => update({ email: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-phone">
                        Phone
                      </label>
                      <input
                        id="r-phone"
                        value={form.phone}
                        onChange={(e) => update({ phone: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-location">
                      Location
                    </label>
                    <input
                      id="r-location"
                      value={form.location}
                      onChange={(e) => update({ location: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-summary">
                      Summary
                    </label>
                    <textarea
                      id="r-summary"
                      value={form.summary}
                      onChange={(e) => update({ summary: e.target.value })}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      placeholder="A short summary of your strengths and target role."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor="r-skills">
                      Skills (comma-separated)
                    </label>
                    <input
                      id="r-skills"
                      value={form.skillsText}
                      onChange={(e) => update({ skillsText: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      placeholder="React, TypeScript, Data Structures, SQL…"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="neon-glass-panel rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                      Experience
                    </h2>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="btn-glow-secondary rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {form.experiences.map((e) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Role
                            </p>
                            <input
                              value={e.role}
                              onChange={(ev) => updateExperience(e.id, { role: ev.target.value })}
                              className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                              placeholder="e.g. Software Engineer"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeExperience(e.id)}
                            disabled={form.experiences.length <= 1}
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Remove experience"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor={`rc-${e.id}-co`}>
                              Company
                            </label>
                            <input
                              id={`rc-${e.id}-co`}
                              value={e.company}
                              onChange={(ev) => updateExperience(e.id, { company: ev.target.value })}
                              className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                              placeholder="Company name"
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor={`rc-${e.id}-start`}>
                                Start
                              </label>
                              <input
                                id={`rc-${e.id}-start`}
                                value={e.start}
                                onChange={(ev) => updateExperience(e.id, { start: ev.target.value })}
                                className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="2024"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor={`rc-${e.id}-end`}>
                                End
                              </label>
                              <input
                                id={`rc-${e.id}-end`}
                                value={e.end}
                                onChange={(ev) => updateExperience(e.id, { end: ev.target.value })}
                                className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="Present"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]" htmlFor={`rc-${e.id}-desc`}>
                            Description
                          </label>
                          <textarea
                            id={`rc-${e.id}-desc`}
                            value={e.description}
                            onChange={(ev) => updateExperience(e.id, { description: ev.target.value })}
                            rows={3}
                            className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                            placeholder="Achievements, metrics, and responsibilities."
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="neon-glass-panel rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                      Education
                    </h2>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="btn-glow-secondary rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {form.educations.map((ed) => (
                      <motion.div
                        key={ed.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Degree
                            </p>
                            <input
                              value={ed.degree}
                              onChange={(ev) => updateEducation(ed.id, { degree: ev.target.value })}
                              className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                              placeholder="B.Tech / B.Sc / M.Sc…"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeEducation(ed.id)}
                            disabled={form.educations.length <= 1}
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Remove education"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]"
                              htmlFor={`re-${ed.id}-school`}
                            >
                              School
                            </label>
                            <input
                              id={`re-${ed.id}-school`}
                              value={ed.school}
                              onChange={(ev) => updateEducation(ed.id, { school: ev.target.value })}
                              className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                              placeholder="University / College"
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <div>
                              <label
                                className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]"
                                htmlFor={`re-${ed.id}-start`}
                              >
                                Start
                              </label>
                              <input
                                id={`re-${ed.id}-start`}
                                value={ed.start}
                                onChange={(ev) => updateEducation(ed.id, { start: ev.target.value })}
                                className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="2019"
                              />
                            </div>
                            <div>
                              <label
                                className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF]"
                                htmlFor={`re-${ed.id}-end`}
                              >
                                End
                              </label>
                              <input
                                id={`re-${ed.id}-end`}
                                value={ed.end}
                                onChange={(ev) => updateEducation(ed.id, { end: ev.target.value })}
                                className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                                placeholder="2023 / Present"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div
                className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-6 backdrop-blur-md shadow-[0_0_40px_rgba(108,99,255,0.08)]"
                animate={{
                  boxShadow: previewFlash
                    ? "0 0 0 1px rgba(0,212,255,0.35), 0 0 32px rgba(108,99,255,0.18)"
                    : "0 0 40px rgba(108,99,255,0.08)",
                  filter: previewFlash ? "brightness(1.05)" : "brightness(1)",
                }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                    Live preview
                  </h2>
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-mono text-slate-400">
                    Updates in real time
                  </span>
                </div>

                <div className="mt-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={previewFlash ? "flash-on" : "flash-off"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ResumeTemplatePreview form={form} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Tip: for best results, keep bullet lines short and add 1–2 measurable outcomes per role.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default ResumeBuilder;

