import type { ReactNode } from "react";

export type ResumeExperience = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
};

export type ResumeEducation = {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
};

export type ResumeForm = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skillsText: string;
  experiences: ResumeExperience[];
  educations: ResumeEducation[];
};

function TextOrPlaceholder({
  value,
  placeholder,
}: {
  value: string;
  placeholder: string;
}): ReactNode {
  return value.trim() ? value : <span className="text-slate-500">{placeholder}</span>;
}

function formatSkills(skillsText: string): string[] {
  return skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const ResumeTemplatePreview = ({ form }: { form: ResumeForm }) => {
  const skills = formatSkills(form.skillsText);

  return (
    <div className="resume-preview-a4 relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">{form.name || "Your Name"}</h2>
            <p className="text-sm font-semibold text-[#00D4FF]">{form.title || "Role / Title"}</p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>
              <span className="text-slate-500">Email:</span> <TextOrPlaceholder value={form.email} placeholder="you@email.com" />
            </span>
            <span>
              <span className="text-slate-500">Phone:</span> <TextOrPlaceholder value={form.phone} placeholder="+1 (555) 123-4567" />
            </span>
            <span>
              <span className="text-slate-500">Location:</span> <TextOrPlaceholder value={form.location} placeholder="City, Country" />
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">Skills</p>
              {skills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] text-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Add a few skills (comma-separated)</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">Summary</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                <TextOrPlaceholder
                  value={form.summary}
                  placeholder="A short summary that shows what you do and what you’re looking for."
                />
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">Experience</p>
              <div className="mt-3 space-y-3">
                {form.experiences.length > 0 ? (
                  form.experiences.map((e) => (
                    <div key={e.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-sm font-semibold text-white">
                        {e.role || "Role"} <span className="text-slate-400">@ {e.company || "Company"}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {e.start || "Start"} — {e.end || "End"}
                      </p>
                      {e.description.trim() ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                          {e.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">Add a 1–3 line achievement / responsibility.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Add experience to see it here.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">Education</p>
              <div className="mt-3 space-y-3">
                {form.educations.length > 0 ? (
                  form.educations.map((ed) => (
                    <div key={ed.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-sm font-semibold text-white">{ed.degree || "Degree"}</p>
                      <p className="mt-0.5 text-sm text-slate-200">{ed.school || "School"}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {ed.start || "Start"} — {ed.end || "End"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Add education to see it here.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

