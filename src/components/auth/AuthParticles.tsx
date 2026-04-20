import { motion } from "framer-motion";

const PARTICLE_SEED = [
  { x: 8, y: 12, s: 2, d: 0 },
  { x: 18, y: 44, s: 1.5, d: 1.2 },
  { x: 32, y: 8, s: 1, d: 0.4 },
  { x: 48, y: 28, s: 2.5, d: 2.1 },
  { x: 62, y: 72, s: 1.2, d: 0.8 },
  { x: 78, y: 18, s: 1.8, d: 1.5 },
  { x: 88, y: 56, s: 1, d: 0.2 },
  { x: 14, y: 78, s: 2, d: 1.8 },
  { x: 38, y: 62, s: 1.3, d: 0.6 },
  { x: 54, y: 92, s: 1.6, d: 2.4 },
  { x: 72, y: 38, s: 1.1, d: 1.1 },
  { x: 92, y: 82, s: 2.2, d: 0.9 },
  { x: 26, y: 88, s: 1, d: 1.6 },
  { x: 66, y: 6, s: 1.4, d: 0.5 },
  { x: 6, y: 52, s: 1.7, d: 2 },
  { x: 44, y: 48, s: 1.2, d: 0.7 },
  { x: 84, y: 34, s: 1.9, d: 1.3 },
  { x: 22, y: 26, s: 1, d: 1.9 },
  { x: 58, y: 14, s: 2.3, d: 0.3 },
  { x: 96, y: 10, s: 1.1, d: 2.2 },
];

export const AuthParticles = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLE_SEED.map((p, i) => (
        <motion.span
          key={i}
          className="auth-particle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
          }}
          animate={{
            opacity: [0.15, 0.55, 0.15],
            y: [0, -18, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + (i % 4),
            delay: p.d,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
