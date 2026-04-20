import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import {
  ConceptSection,
  type ConceptBlock,
} from "../components/conceptExplanation/ConceptSection";

function buildMockExplanation(topic: string): ConceptBlock[] {
  const t = topic.trim() || "this topic";
  return [
    {
      id: "1",
      title: "Definition",
      body: `${t} is a core idea you can explain in one breath: it names a pattern, mechanism, or principle that shows up in lectures, labs, and exams. Nexivo generates this scaffold so you can replace it with course-specific wording from your notes.`,
      examples: [
        `Course hook: how your professor introduced ${t} on day one.`,
        `Textbook: the formal definition plus one sentence in plain English.`,
        `Contrast: what ${t} is not — a common misconception students mix up.`,
      ],
      notes: [
        "Rewrite the definition in your own words to check understanding.",
        "Link the term to a diagram or formula from your materials.",
      ],
    },
    {
      id: "2",
      title: "Why it matters",
      body: `Understanding ${t} unlocks the next layer of the syllabus: assignments assume you can recognize when it applies and explain tradeoffs. In interviews and vivas, examiners often ask for intuition before details.`,
      examples: [
        `Problem type: a typical exam question that requires ${t}.`,
        `Real use: one industry or research area where the idea appears.`,
        `Dependency: which topics you should revisit if ${t} still feels fuzzy.`,
      ],
      notes: [
        "Sketch a 30-second elevator explanation you could say out loud.",
        "Note one mistake you personally tend to make around this idea.",
      ],
    },
    {
      id: "3",
      title: "How to practice",
      body: `Active recall beats re-reading. For ${t}, alternate quick definitions with worked examples, then teach the idea back to someone else (or Nexivo’s doc chat). Spaced repetition cements the mental model.`,
      examples: [
        "Flashcard: front = term, back = definition + one example.",
        "Mini quiz: three true/false statements about edge cases.",
        "Explain while drawing: boxes and arrows for relationships.",
      ],
      notes: [
        "Schedule a second review in 24–48 hours for retention.",
        "Connect to a past assignment where you already used this idea.",
      ],
    },
  ];
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const ConceptExplanation = () => {
  const [topic, setTopic] = useState("Recursion");
  const [blocks, setBlocks] = useState<ConceptBlock[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const explain = useCallback(() => {
    const trimmed = topic.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setBlocks(null);
    setRunKey((k) => k + 1);
    window.setTimeout(() => {
      setBlocks(buildMockExplanation(trimmed));
      setBusy(false);
    }, 720);
  }, [topic, busy]);

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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Concept explainer</h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter any topic for a structured breakdown. Expand examples and notes under each section.
            </p>
          </div>

          <div className="relative z-[2] mx-auto max-w-3xl space-y-6">
            <div className="neon-glass-panel rounded-2xl p-5">
              <label htmlFor="concept-topic" className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                Topic
              </label>
              <input
                id="concept-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") explain();
                }}
                placeholder="e.g. Gradient descent, HTTP, supply & demand…"
                className="mt-3 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
              />
              <button
                type="button"
                onClick={explain}
                disabled={busy || !topic.trim()}
                className="btn-glow-primary mt-4 w-full rounded-xl py-3 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40"
              >
                {busy ? "Building explanation…" : "Explain concept"}
              </button>
              <p className="mt-3 text-xs text-slate-500">
                Demo content is templated from your topic. Plug in an LLM to generate course-accurate text.
              </p>
            </div>

            {blocks && blocks.length > 0 ? (
              <motion.div
                key={runKey}
                className="space-y-4"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">
                  Explanation
                </h2>
                {blocks.map((b) => (
                  <ConceptSection key={b.id} block={b} />
                ))}
              </motion.div>
            ) : !busy ? (
              <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center text-sm text-slate-500">
                Run explain to reveal sections with animated entry.
              </p>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/25 py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-12 w-12 rounded-full border-2 border-[#6C63FF]/30 border-t-[#00D4FF]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-slate-400">Structuring sections…</p>
              </motion.div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default ConceptExplanation;
