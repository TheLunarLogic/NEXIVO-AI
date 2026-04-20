import { motion } from "framer-motion";

type Props = {
  active: boolean;
};

export const OCRScanOverlay = ({ active }: Props) => {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl">
      <motion.div
        className="ocr-scan-dim absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(108,99,255,0.04)_2px,rgba(108,99,255,0.04)_4px)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="ocr-scan-line absolute left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent shadow-[0_0_20px_#00D4FF]"
        initial={{ top: "0%" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#6C63FF]/5 via-transparent to-[#00D4FF]/5"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    </div>
  );
};
