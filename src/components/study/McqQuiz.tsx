import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QuizScoreBar } from "./QuizScoreBar";

export type McqItem = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
};

type McqQuizProps = {
  items: McqItem[];
};

export const McqQuiz = ({ items }: McqQuizProps) => {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = items[index];
  const total = items.length;

  const getCorrectIndex = (item: McqItem) => {
    return item.options.indexOf(item.answer);
  };

  const pick = (i: number) => {
    if (picked !== null || !q || finished) return;
    setPicked(i);
    if (i === getCorrectIndex(q)) setScore((s) => s + 1);
  };

  const next = () => {
    if (picked === null || !q) return;
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  if (total === 0) {
    return <p className="text-sm text-slate-500 text-center py-10">No quiz items available.</p>;
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#6C63FF]/20 text-[#6C63FF]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-white">Quiz complete!</p>
        <p className="mt-2 text-sm text-slate-400">
          You scored <span className="font-mono text-[#00D4FF] text-lg font-bold">{score}</span> / <span className="font-mono">{total}</span>
        </p>
        <div className="mt-6">
          <QuizScoreBar score={score} total={total} label="Final Accuracy" />
        </div>
        <button
          type="button"
          onClick={restart}
          className="btn-glow-primary mt-8 w-full rounded-xl py-3.5 text-sm font-bold tracking-wide"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  const correctIdx = getCorrectIndex(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400">
            Question <span className="text-white">{index + 1}</span> of {total}
          </span>
          {q.difficulty && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              q.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              q.difficulty === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {q.difficulty}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={restart}
          className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition hover:border-white/20 hover:text-white"
        >
          Reset
        </button>
      </div>

      <QuizScoreBar score={score} total={total} />

      <motion.div
        key={q.id || index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-white/10 bg-black/40 p-6"
      >
        <h3 className="text-base font-semibold leading-relaxed text-slate-100">{q.question}</h3>
        
        <div className="mt-6 grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === correctIdx;
            const showResult = picked !== null;
            
            let stateStyle = "border-white/10 hover:border-[#6C63FF]/50 bg-white/5";
            if (showResult) {
              if (isCorrect) stateStyle = "border-emerald-500/60 bg-emerald-500/15 text-emerald-100";
              else if (isPicked) stateStyle = "border-rose-500/50 bg-rose-500/10 text-rose-100";
              else stateStyle = "border-white/5 opacity-40 bg-transparent";
            }

            return (
              <button
                key={i}
                type="button"
                disabled={picked !== null}
                onClick={() => pick(i)}
                className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left text-sm transition-all duration-200 ${stateStyle}`}
              >
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-bold transition-colors ${
                  showResult && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" :
                  showResult && isPicked ? "bg-rose-500 border-rose-500 text-white" :
                  "bg-white/5 border-white/10 text-[#00D4FF] group-hover:border-[#6C63FF]/50"
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                {q.explanation && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D4FF]/80">Explanation</span>
                    <p className="mt-1.5 text-xs italic leading-relaxed text-slate-400">
                      {q.explanation}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {picked === correctIdx ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Nice work!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Incorrect
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={next}
                    className="btn-glow-primary rounded-xl px-6 py-2.5 text-xs font-bold"
                  >
                    {index + 1 >= total ? "See Results" : "Continue"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
