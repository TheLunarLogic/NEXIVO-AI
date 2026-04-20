import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MS_PER_CHAR = 16;

type Props = {
  text: string;
  start: boolean;
  delayMs?: number;
};

export const TypingAnswer = ({ text, start, delayMs = 0 }: Props) => {
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!start || !text) return;
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = window.setTimeout(() => {
      let i = 0;
      iv = window.setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length && iv) window.clearInterval(iv);
      }, MS_PER_CHAR);
    }, delayMs);
    return () => {
      window.clearTimeout(t);
      if (iv) window.clearInterval(iv);
    };
  }, [start, text, delayMs]);

  const showCaret = start && out.length < text.length;

  return (
    <p className="text-sm leading-relaxed text-slate-200">
      {out}
      {showCaret && (
        <motion.span
          className="inline-block w-0.5 bg-[#00D4FF] align-baseline"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.55, repeat: Infinity }}
          style={{ height: "1em" }}
          aria-hidden
        />
      )}
    </p>
  );
};
