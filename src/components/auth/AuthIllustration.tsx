import { motion } from "framer-motion";

export const AuthIllustration = () => {
  return (
    <div className="relative flex min-h-[280px] flex-1 items-center justify-center md:min-h-0">
      <div className="auth-illustration-glow absolute inset-0 rounded-[2rem] opacity-90" />

      <motion.div
        className="relative z-[1] flex flex-col items-center justify-center px-6 py-10"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Central AI assistant orb */}
        <motion.div
          className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#6C63FF]/40 via-[#1e1b4b]/80 to-[#00D4FF]/25 shadow-[0_0_60px_rgba(108,99,255,0.45),inset_0_0_40px_rgba(0,212,255,0.12)] sm:h-44 sm:w-44"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.span
            className="text-5xl sm:text-6xl"
            animate={{ rotateY: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            🤖
          </motion.span>
          <motion.span
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#00D4FF] shadow-[0_0_12px_#00D4FF]"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        <p className="relative z-[1] mt-12 max-w-xs text-center text-sm font-medium text-slate-300">
          Nexivo keeps your study flow in sync—plans, notes, and focus in one intelligent workspace.
        </p>

        {/* Floating UI chips */}
        <motion.div
          className="auth-float-card absolute left-[6%] top-[10%] rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur-md sm:left-[10%]"
          animate={{ y: [0, -8, 0], rotate: [-3, 0, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨ AI summary
        </motion.div>
        <motion.div
          className="auth-float-card absolute right-[8%] top-[15%] rounded-2xl border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-3 py-2 text-xs text-[#CFF9FF] shadow-lg backdrop-blur-md sm:right-[12%]"
          animate={{ y: [0, 10, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          📅 Smart plan
        </motion.div>
        <motion.div
          className="auth-float-card absolute top-[42%] left-[12%] rounded-2xl border border-[#6C63FF]/35 bg-[#6C63FF]/15 px-3 py-2 text-xs text-violet-100 shadow-lg backdrop-blur-md"
          animate={{ y: [0, -6, 0], x: [0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          🎯 Focus mode
        </motion.div>
        <motion.div
          className="auth-float-card absolute top-[44%] right-[10%] hidden rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur-md sm:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          📚 Notes synced
        </motion.div>
      </motion.div>
    </div>
  );
};
