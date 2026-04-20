import { motion } from "framer-motion";

export const ChatTypingIndicator = () => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex max-w-[85%] items-center gap-3 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3"
      role="status"
      aria-label="Assistant is typing"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nexivo</span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[#00D4FF]/80"
            animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 0.55,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
