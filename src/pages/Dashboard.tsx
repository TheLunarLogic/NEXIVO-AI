import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const HOURS = ["9:00", "11:00", "2:00", "4:00"] as const;

const scheduleBlocks: Record<string, { label: string; sub: string } | null> = {
  "0-0": { label: "Linear Algebra", sub: "Room 204" },
  "1-1": { label: "Organic Chem", sub: "Lab A" },
  "2-2": { label: "AI & Ethics", sub: "Hybrid" },
  "3-0": { label: "Data Structures", sub: "Online" },
  "0-2": null,
  "1-2": { label: "Office hours", sub: "Prof. Lee" },
};

const weekAttendance = [88, 92, 85, 94, 90, 96, 91];

const aiActivity = [
  { icon: "📝", title: "Summarized O-Chem lecture", time: "12 min ago", tone: "from-[#6C63FF]/30" },
  { icon: "🃏", title: "Generated 24 flashcards for Unit 4", time: "1 hr ago", tone: "from-[#00D4FF]/25" },
  { icon: "📅", title: "Rescheduled study blocks for finals week", time: "3 hr ago", tone: "from-[#FF6B6B]/20" },
  { icon: "💬", title: "Explained eigenvectors with analogies", time: "Yesterday", tone: "from-[#6C63FF]/25" },
];

const quickActions = [
  { emoji: "⚡", title: "New task", sub: "Capture a deadline" },
  { emoji: "✨", title: "Summarize", sub: "Notes or PDF" },
  { emoji: "🃏", title: "Flashcards", sub: "From any topic" },
  { emoji: "🎯", title: "Focus mode", sub: "25 min sprint" },
] as const;

const tabs = [
  { id: "workspace", label: "Workspace" },
  { id: "insights", label: "Insights" },
  { id: "activity", label: "AI activity" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

const DashboardFloatCard = ({
  children,
  className = "",
  depth = "normal",
}: {
  children: ReactNode;
  className?: string;
  depth?: "normal" | "deep";
}) => (
  <motion.div
    className={`dashboard-float-card neon-glass-panel rounded-2xl p-5 ${className}`}
    style={{ transformStyle: "preserve-3d" }}
    whileHover={{
      y: -6,
      rotateX: depth === "deep" ? -2 : -1,
      rotateY: depth === "deep" ? 1 : 0.5,
      transition: { type: "spring", stiffness: 280, damping: 22 },
    }}
  >
    {children}
  </motion.div>
);

const AttendanceRing = ({ pct }: { pct: number }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center">
      <svg className="w-full -rotate-90 transform" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="text-4xl font-bold tabular-nums bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {pct}%
        </motion.span>
        <span className="text-xs text-slate-400">Attendance</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [tab, setTab] = useState<TabId>("workspace");

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Glass workspace with live AI telemetry — stay ahead of every deadline.
            </p>
          </div>
          <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative rounded-xl px-3 py-2 text-xs font-medium transition sm:text-sm ${
                  tab === t.id ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="dash-tab"
                    className="absolute inset-0 rounded-xl bg-[#6C63FF]/35 shadow-[0_0_20px_rgba(108,99,255,0.25)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-[1]">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "workspace" && (
            <motion.div
              key="workspace"
              className="grid gap-5 lg:grid-cols-12"
              {...tabTransition}
            >
              <motion.section
                id="planner"
                className="lg:col-span-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <DashboardFloatCard depth="deep">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Timetable preview</h2>
                    <span className="rounded-full border border-[#00D4FF]/35 bg-[#00D4FF]/10 px-2.5 py-0.5 text-xs text-[#9EF6FF]">
                      This week
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/25">
                    <div className="min-w-[480px]">
                      <div
                        className="grid gap-px bg-white/10"
                        style={{ gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)` }}
                      >
                        <div className="bg-slate-950/80 p-2" />
                        {DAYS.map((d) => (
                          <div
                            key={d}
                            className="bg-slate-950/80 p-2 text-center text-xs font-medium text-slate-300"
                          >
                            {d}
                          </div>
                        ))}
                        {HOURS.map((hour, hi) => (
                          <Fragment key={hour}>
                            <div className="flex items-center bg-slate-950/60 px-2 py-3 text-xs text-slate-500">
                              {hour}
                            </div>
                            {DAYS.map((_, di) => {
                              const cellKey = `${hi}-${di}`;
                              const block = scheduleBlocks[cellKey];
                              return (
                                <div
                                  key={cellKey}
                                  className="min-h-[4.5rem] bg-slate-900/40 p-1.5"
                                >
                                  {block && (
                                    <motion.div
                                      className="h-full rounded-lg bg-gradient-to-br from-[#6C63FF]/50 to-[#00D4FF]/30 p-2 text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                      layout
                                      initial={{ opacity: 0, scale: 0.92 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                    >
                                      <p className="font-semibold text-white">{block.label}</p>
                                      <p className="mt-0.5 text-[10px] text-slate-200/90">{block.sub}</p>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </DashboardFloatCard>
              </motion.section>

              <motion.div className="flex flex-col gap-5 lg:col-span-5">
                <DashboardFloatCard>
                  <h2 className="mb-3 text-lg font-semibold" id="courses">
                    Quick actions
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((a) => (
                      <motion.button
                        key={a.title}
                        type="button"
                        className="neon-quick-action flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-3 text-left transition"
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-xl">{a.emoji}</span>
                        <span className="mt-2 text-sm font-semibold text-white">{a.title}</span>
                        <span className="text-xs text-slate-400">{a.sub}</span>
                      </motion.button>
                    ))}
                  </div>
                </DashboardFloatCard>

                <DashboardFloatCard>
                  <h2 className="mb-3 text-lg font-semibold" id="ai">
                    Recent AI activity
                  </h2>
                  <ul className="space-y-3">
                    {aiActivity.slice(0, 2).map((item) => (
                      <li
                        key={item.title}
                        className={`flex gap-3 rounded-xl border border-white/8 bg-gradient-to-r ${item.tone} to-transparent px-3 py-2.5`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-100">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DashboardFloatCard>
              </motion.div>
            </motion.div>
          )}

          {tab === "insights" && (
            <motion.div key="insights" className="grid gap-5 lg:grid-cols-2" {...tabTransition}>
              <DashboardFloatCard depth="deep" className="lg:min-h-[340px]">
                <h2 className="mb-2 text-lg font-semibold">Attendance stats</h2>
                <p className="mb-5 text-sm text-slate-400">Rolling 7-day presence across enrolled courses.</p>
                <AttendanceRing pct={92} />
                <p className="mt-4 text-center text-xs text-slate-500">+4% vs last month — keep the streak!</p>
              </DashboardFloatCard>

              <DashboardFloatCard className="lg:min-h-[340px]">
                <h2 className="mb-4 text-lg font-semibold">Weekly presence</h2>
                <div className="flex h-48 items-end justify-between gap-2 px-1">
                  {weekAttendance.map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-[#6C63FF]/70 to-[#00D4FF]/90 shadow-[0_0_16px_rgba(108,99,255,0.35)]"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                          delay: 0.06 * i,
                          duration: 0.65,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                          height: `${(v / 100) * 160}px`,
                          transformOrigin: "bottom",
                        }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </DashboardFloatCard>
            </motion.div>
          )}

          {tab === "activity" && (
            <motion.div key="activity" className="max-w-3xl" {...tabTransition}>
              <DashboardFloatCard depth="deep">
                <h2 className="mb-1 text-lg font-semibold">AI activity stream</h2>
                <p className="mb-6 text-sm text-slate-400">Everything Nexivo generated or adapted for you recently.</p>
                <ul className="space-y-4">
                  {aiActivity.map((item, i) => (
                    <motion.li
                      key={item.title}
                      className={`flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-r ${item.tone} to-transparent p-4`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.07 * i }}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/30 text-2xl shadow-lg">
                        {item.icon}
                      </span>
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.time}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </DashboardFloatCard>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </motion.div>
  );
};

export default Dashboard;
