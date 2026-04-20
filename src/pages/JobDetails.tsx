import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

type CompanyInfo = {
  size?: string | null;
  industry?: string | null;
  website?: string | null;
};

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
  companyInfo?: CompanyInfo;
  description?: string;
};

export default function JobDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const job = (state as { job?: Job } | null)?.job;

  const safeDescription = useMemo(() => {
    const d = job?.description ?? job?.blurb ?? "";
    return d.trim() ? d : "No description provided.";
  }, [job?.description, job?.blurb]);

  if (!job) {
    return (
      <motion.div
        className="relative min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <DashboardLayout>
          <div className="relative z-[2] mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-bold">Job details</h1>
            <p className="mt-2 text-sm text-slate-400">
              No job data was passed to this page. Go back to Job Finder.
            </p>
            <button
              type="button"
              onClick={() => {
                navigate(-1);
              }}
              className="btn-glow-primary mt-6 rounded-xl px-5 py-2 text-sm font-semibold"
            >
              Back to Job Finder
            </button>
          </div>
        </DashboardLayout>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>


        <div className="relative z-[2] mx-auto max-w-3xl px-3 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{job.role}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {job.company} · {job.location} · {job.experience}
            </p>
          </div>

          <div className="neon-glass-panel rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-[#00D4FF]/35 bg-[#00D4FF]/10 px-3 py-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#7AE9FF]">
                      Match score
                    </span>
                    <span className="block font-mono text-xl font-bold text-white">{job.match}%</span>
                  </span>
                  {typeof job.similarityScore === "number" ? (
                    <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Similarity
                      </span>
                      <span className="block font-mono text-sm font-semibold text-slate-200">
                        {job.similarityScore}
                      </span>
                    </span>
                  ) : null}
                </div>

                {job.matchReason ? (
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-[#00D4FF]">Why this match:</span>{" "}
                    {job.matchReason}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:items-end">
                {job.link ? (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glow-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold"
                  >
                    Apply
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold opacity-50"
                  >
                    Apply link not available
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    navigate(-1);
                  }}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">
                  Description
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                  {safeDescription}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">
                    Requirements
                  </h2>
                  {job.requirements && job.requirements.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
                      {job.requirements.map((r, i) => (
                        <li key={`${r}-${i}`}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No requirements provided.</p>
                  )}
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">
                    Benefits
                  </h2>
                  {job.benefits && job.benefits.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
                      {job.benefits.map((b, i) => (
                        <li key={`${b}-${i}`}>{b}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No benefits provided.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">
                  Company info
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Size
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      {job.companyInfo?.size ?? "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Industry
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      {job.companyInfo?.industry ?? "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Salary
                    </p>
                    <p className="mt-1 text-sm text-slate-200">{job.salary ?? "Not provided"}</p>
                  </div>
                </div>

                {job.companyInfo?.website ? (
                  <p className="mt-3 text-sm text-slate-300">
                    Website:{" "}
                    <a
                      href={job.companyInfo.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00D4FF] hover:underline"
                    >
                      {job.companyInfo.website}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
}

