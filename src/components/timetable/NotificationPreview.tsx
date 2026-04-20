import { motion } from "framer-motion";

type Props = {
  visible: boolean;
  title: string;
  subtitle: string;
  subjectColor: string;
};

export const NotificationPreview = ({ visible, title, subtitle, subjectColor }: Props) => {
  return (
    <motion.div
      className="pointer-events-none fixed right-4 top-20 z-[60] max-w-[280px] sm:right-6 sm:top-24"
      initial={false}
      animate={
        visible
          ? { x: 0, opacity: 1, scale: 1 }
          : { x: 120, opacity: 0, scale: 0.92 }
      }
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <div
        className="neon-glass-panel flex gap-3 rounded-2xl border p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        style={{ borderColor: `${subjectColor}55` }}
      >
        <motion.span
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: `${subjectColor}22`, boxShadow: `0 0 20px ${subjectColor}33` }}
          animate={visible ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.6, repeat: visible ? Infinity : 0, repeatDelay: 2.5 }}
        >
          🔔
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900"
            style={{ background: subjectColor }}
          />
        </motion.span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00D4FF]">Soon</p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          <motion.div
            className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${subjectColor}, #00D4FF)` }}
              initial={{ width: "0%" }}
              animate={visible ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 4, ease: "linear", repeat: visible ? Infinity : 0 }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
