import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

const aiActivity = [
  { icon: "💬", title: "Answered questions on uploaded notes", time: "12 min ago", tone: "from-[#6C63FF]/30" },
  { icon: "🃏", title: "Generated 24 flashcards for Unit 4", time: "1 hr ago", tone: "from-[#00D4FF]/25" },
  { icon: "📅", title: "Rescheduled study blocks for finals week", time: "3 hr ago", tone: "from-[#FF6B6B]/20" },
  { icon: "🔄", title: "Converted a flowchart into starter code", time: "Yesterday", tone: "from-[#6C63FF]/25" },
];

const quickActions = [
  { emoji: "⚡", title: "New task", sub: "Capture a deadline" },
  { emoji: "🃏", title: "Flashcards", sub: "From any topic" },
  { emoji: "🎯", title: "Focus mode", sub: "25 min sprint" },
] as const;

const tabs = [
  { id: "workspace", label: "Workspace" },
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
                    <h2 className="text-lg font-semibold">Planner preview</h2>
                    <span className="rounded-full border border-[#00D4FF]/35 bg-[#00D4FF]/10 px-2.5 py-0.5 text-xs text-[#9EF6FF]">
                      This week
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-6 text-sm text-slate-400">
                    Your planner widgets will live here. (This demo view is intentionally minimal.)
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
