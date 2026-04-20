import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function buildMockParagraphs(fileName: string): string[] {
  const base = fileName.replace(/\.[^/.]+$/, "") || "your document";
  return [
    `Overview — Nexivo extracted the core narrative from “${base}”: the material centers on structured ideas you can revisit quickly before exams or assignments.`,
    `Key points — (1) Main thesis or objective is preserved from the source. (2) Supporting arguments are grouped by theme so you can skim hierarchically. (3) Action items and definitions are highlighted for spaced repetition.`,
    `Suggested next steps — Drop follow-up files to compare versions, or ask the AI coach to generate flashcards from this summary. Connect a backend to run real summarization.`,
  ];
}

const textRevealContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const textRevealItem = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const DocumentSummarizer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewSnippet, setPreviewSnippet] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [summaryParagraphs, setSummaryParagraphs] = useState<string[]>([]);
  const [summaryKey, setSummaryKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  useEffect(() => () => clearProgressTimer(), []);

  const loadFile = useCallback(async (f: File) => {
    setFile(f);
    setPreviewSnippet(null);
    setSummaryParagraphs([]);
    const textish =
      f.type.startsWith("text/") ||
      /\.(txt|md|csv|json)$/i.test(f.name);
    if (textish && f.size < 2 * 1024 * 1024) {
      try {
        const t = await f.text();
        setPreviewSnippet(t.slice(0, 2800));
      } catch {
        setPreviewSnippet(null);
      }
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void loadFile(f);
  };

  const runSummarize = () => {
    if (!file || busy) return;
    clearProgressTimer();
    setBusy(true);
    setProgress(0);
    setSummaryParagraphs([]);
    setSummaryKey((k) => k + 1);

    const start = performance.now();
    const durationMs = 2400;

    progressTimer.current = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      setProgress(Math.round(t * 100));
      if (t >= 1) {
        clearProgressTimer();
        setSummaryParagraphs(buildMockParagraphs(file.name));
        setBusy(false);
      }
    }, 32);
  };

  const removeFile = () => {
    clearProgressTimer();
    setFile(null);
    setPreviewSnippet(null);
    setProgress(0);
    setBusy(false);
    setSummaryParagraphs([]);
    setSummaryKey((k) => k + 1);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="relative z-[1]">

          <div className="relative z-[2] mb-8 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Document summarizer</h1>
            <p className="mt-1 text-sm text-slate-400">
              Drop notes, PDFs, or text files on the left — preview the source, then generate an AI-style
              summary on the right with animated progress and reveals.
            </p>
          </div>

          <div className="relative z-[2] grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Input column */}
            <motion.section
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`summarizer-dropzone neon-glass-panel cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition duration-300 ${
                  dragOver
                    ? "border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_40px_rgba(0,212,255,0.25)]"
                    : "border-white/20 hover:border-[#6C63FF]/50 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx,.csv,.json,text/*,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void loadFile(f);
                  }}
                />
                <motion.div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF]/35 to-[#00D4FF]/20 text-3xl"
                  animate={dragOver ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  {dragOver ? "📥" : "📤"}
                </motion.div>
                <p className="font-semibold text-white">Drag & drop a document</p>
                <p className="mt-1 text-sm text-slate-500">or click to browse · PDF, TXT, MD, and more</p>
              </div>

              <AnimatePresence mode="wait">
                {file && (
                  <motion.div
                    key={file.name + file.size}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="neon-glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl p-4 min-h-[200px]"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{file.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {file.type || "Unknown type"} · {formatBytes(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="shrink-0 rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Preview
                    </p>
                    <div className="mt-2 max-h-[min(320px,45vh)] flex-1 overflow-y-auto rounded-xl border border-white/8 bg-black/25 p-3">
                      {previewSnippet ? (
                        <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-300">
                          {previewSnippet}
                          {previewSnippet.length >= 2800 ? "…" : ""}
                        </pre>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Binary or large file — preview shows metadata only. Summarization still runs on a
                          demo pipeline.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={(e) => {
                        e.stopPropagation();
                        runSummarize();
                      }}
                      className="btn-glow-primary mt-4 w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                    >
                      {busy ? "Summarizing…" : "Generate summary"}
                    </button>

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] uppercase text-slate-500">
                        <span>Upload & process</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="summarizer-progress-fill h-full rounded-full bg-gradient-to-r from-[#6C63FF] via-[#8B84FF] to-[#00D4FF]"
                          initial={false}
                          animate={{ width: `${progress}%` }}
                          transition={{
                            type: "spring",
                            stiffness: progress >= 100 ? 200 : 80,
                            damping: 20,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Output column */}
            <motion.section
              className="flex flex-col"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
            >
              <div className="neon-glass-panel flex min-h-[min(520px,60vh)] flex-col rounded-2xl p-5 lg:min-h-[560px]">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-lg font-semibold">Summary</h2>
                  <span className="rounded-full border border-[#00D4FF]/35 bg-[#00D4FF]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#9EF6FF]">
                    AI output
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {summaryParagraphs.length === 0 ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-slate-500">
                      <motion.span
                        className="text-4xl"
                        animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                      <p className="mt-4 max-w-xs text-sm">
                        Upload a document and tap <span className="text-[#00D4FF]">Generate summary</span> to
                        see the animated text reveal here.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      key={summaryKey}
                      className="space-y-5"
                      variants={textRevealContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {summaryParagraphs.map((para, i) => {
                        const dash = para.indexOf(" — ");
                        const head = dash > 0 ? para.slice(0, dash) : "";
                        const body = dash > 0 ? para.slice(dash + 3) : para;
                        return (
                          <motion.p
                            key={i}
                            variants={textRevealItem}
                            className="text-sm leading-relaxed text-slate-200"
                          >
                            {head && (
                              <span className="font-semibold text-white">{head} — </span>
                            )}
                            {dash > 0 ? body : para}
                          </motion.p>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default DocumentSummarizer;
