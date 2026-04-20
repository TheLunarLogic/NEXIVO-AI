import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ConceptBlock = {
  id: string;
  title: string;
  body: string;
  examples: string[];
  notes: string[];
};

const chevronPath = "M6 9l6 6 6-6";

type ConceptSectionProps = {
  block: ConceptBlock;
};

export const ConceptSection = ({ block }: ConceptSectionProps) => {
  const baseId = useId();
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
        },
      }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm"
    >
      <div className="border-b border-white/8 px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight text-white">{block.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{block.body}</p>
      </div>

      <div className="divide-y divide-white/8">
        <div>
          <button
            type="button"
            id={`${baseId}-ex-btn`}
            aria-expanded={examplesOpen}
            aria-controls={`${baseId}-ex-panel`}
            onClick={() => setExamplesOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm font-medium text-[#00D4FF] transition hover:bg-white/[0.04]"
          >
            <span>Examples</span>
            <motion.svg
              className="h-5 w-5 shrink-0 text-[#00D4FF]/80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: examplesOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            >
              <path d={chevronPath} strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {examplesOpen ? (
              <motion.div
                key="ex"
                id={`${baseId}-ex-panel`}
                role="region"
                aria-labelledby={`${baseId}-ex-btn`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="space-y-2 px-5 pb-4 pt-0 text-sm text-slate-400">
                  {block.examples.map((ex, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className="flex gap-2 rounded-lg border border-white/8 bg-black/25 px-3 py-2"
                    >
                      <span className="font-mono text-[#6C63FF]">{i + 1}.</span>
                      <span>{ex}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div>
          <button
            type="button"
            id={`${baseId}-notes-btn`}
            aria-expanded={notesOpen}
            aria-controls={`${baseId}-notes-panel`}
            onClick={() => setNotesOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm font-medium text-[#6C63FF] transition hover:bg-white/[0.04]"
          >
            <span>Notes</span>
            <motion.svg
              className="h-5 w-5 shrink-0 text-[#6C63FF]/80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: notesOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            >
              <path d={chevronPath} strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {notesOpen ? (
              <motion.div
                key="notes"
                id={`${baseId}-notes-panel`}
                role="region"
                aria-labelledby={`${baseId}-notes-btn`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="list-disc space-y-1.5 px-5 pb-4 pl-9 text-sm text-slate-400">
                  {block.notes.map((n, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                    >
                      {n}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
};
