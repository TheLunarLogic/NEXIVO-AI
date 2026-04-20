import { useState } from "react";
import { motion } from "framer-motion";
import { QuizScoreBar } from "./QuizScoreBar";

export type FlashcardData = {
  id: string;
  front: string;
  back: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
};

type FlashcardDeckProps = {
  cards: FlashcardData[];
};

export const FlashcardDeck = ({ cards }: FlashcardDeckProps) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  const total = cards.length;

  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => Math.min(total - 1, i + 1));
  };

  if (total === 0) {
    return <p className="text-sm text-slate-500 text-center py-10">No flashcards available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-400">
          Card <span className="text-white">{index + 1}</span> of {total}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tap to flip</span>
      </div>

      <QuizScoreBar score={index + 1} total={total} label="Progress" />

      <div className="mx-auto w-full max-w-lg" style={{ perspective: 1100 }}>
        <motion.div
          key={card.id || index}
          className="relative min-h-[280px] w-full cursor-pointer select-none"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0, opacity: 0 }}
          animate={{ rotateY: flipped ? 180 : 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Show question" : "Show answer"}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-br from-[#161b2e] via-[#0f1424] to-black/50 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <span className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#00D4FF]/80">
              Question
            </span>
            <p className="text-base font-semibold leading-relaxed text-slate-100">{card.front}</p>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[#6C63FF]/35 bg-gradient-to-br from-[#6C63FF]/20 via-[#12182a] to-black/70 p-8 text-center shadow-[0_20px_60px_rgba(108,99,255,0.15)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6C63FF]/90">
                Answer
              </span>
              {card.difficulty && (
                <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                  card.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  card.difficulty === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {card.difficulty}
                </span>
              )}
            </div>
            
            <p className="text-sm font-semibold leading-relaxed text-emerald-100/90">{card.back}</p>
            
            {card.explanation && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Explanation</span>
                <p className="mt-1.5 text-xs italic leading-relaxed text-slate-400 px-2">
                  {card.explanation}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={index <= 0}
          className="flex-1 rounded-xl border border-white/12 bg-white/5 py-3.5 text-sm font-bold text-slate-300 transition hover:border-white/25 hover:text-white disabled:opacity-20"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={index >= total - 1}
          className="btn-glow-primary flex-1 rounded-xl py-3.5 text-sm font-bold disabled:opacity-20"
        >
          Next Card
        </button>
      </div>
    </div>
  );
};
