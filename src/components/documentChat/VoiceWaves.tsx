import { motion } from "framer-motion";

interface VoiceWavesProps {
  active: boolean;
}

export const VoiceWaves = ({ active }: VoiceWavesProps) => {
  return (
    <div className="flex h-32 items-center justify-center gap-1.5 px-4">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-[#6C63FF] to-[#00D4FF]"
          initial={{ height: 8 }}
          animate={
            active
              ? {
                  height: [8, 16 + Math.random() * 48, 8],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 8, opacity: 0.3 }
          }
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
};
