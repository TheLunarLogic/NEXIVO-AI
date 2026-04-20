import { motion } from "framer-motion";

type QuizScoreBarProps = {
  score: number;
  total: number;
  label?: string;
};

export const QuizScoreBar = ({ score, total, label = "Score" }: QuizScoreBarProps) => {
  const pct = total > 0 ? Math.min(100, Math.round((score / total) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">{label}</span>
        <motion.span
          key={`${score}-${total}`}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35 }}
          className="font-mono font-semibold tabular-nums text-slate-200"
        >
          {score} / {total}
        </motion.span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/40">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[#7c6cff] to-[#00D4FF] shadow-[0_0_16px_rgba(108,99,255,0.45)]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.8 }}
        />
      </div>
    </div>
  );
};
