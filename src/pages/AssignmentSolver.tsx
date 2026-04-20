import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { OCRScanOverlay } from "../components/assignment/OCRScanOverlay";
import { TypingAnswer } from "../components/assignment/TypingAnswer";

const MOCK_QUESTIONS = [
  "Find the derivative of f(x) = ln(x² + 1) with respect to x.",
  "Explain Newton’s third law with one real-world example.",
  "What is the time complexity of merging two sorted arrays of size n and m?",
];

const MOCK_ANSWERS = [
  "Using the chain rule: f′(x) = (1/(x²+1)) · d/dx(x²+1) = 2x/(x²+1). Nexivo highlights substitution steps so you can verify each layer on paper.",
  "Newton’s third law: for every action there is an equal and opposite reaction. Example: when you jump, your legs push Earth down and Earth pushes you up with equal magnitude — you move more because Earth’s mass is enormous.",
  "Merging two sorted arrays with a standard two-pointer merge takes O(n + m) time and O(n + m) extra space if you materialize a new array, or O(1) extra space if you merge into one of the inputs with enough capacity.",
];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type Phase = "idle" | "scanning" | "extracted";

const AssignmentSolver = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<string[]>([]);
  const [solveRun, setSolveRun] = useState(false);
  const [solveKey, setSolveKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const revokePreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => () => revokePreview(), [revokePreview]);

  const loadFile = (f: File) => {
    revokePreview();
    setFile(f);
    setPhase("idle");
    setQuestions([]);
    setSolveRun(false);
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    revokePreview();
    setFile(null);
    setPhase("idle");
    setQuestions([]);
    setSolveRun(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const runExtract = async () => {
    if (!file || phase === "scanning") return;
    setQuestions([]);
    setSolveRun(false);
    setPhase("scanning");
    await new Promise((r) => setTimeout(r, 2800));
    setQuestions(MOCK_QUESTIONS);
    setPhase("extracted");
  };

  const runSolve = () => {
    if (questions.length === 0) return;
    setSolveRun(false);
    setSolveKey((k) => k + 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSolveRun(true));
    });
  };

  const scanning = phase === "scanning";

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


          <div className="relative z-[2] mb-8 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Assignment solver</h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload a worksheet photo or PDF placeholder, watch the OCR-style scan, then review
              extracted questions and step-by-step answers with a live typing effect.
            </p>
          </div>

          <div className="relative z-[2] grid gap-6 xl:grid-cols-3">
            {/* Upload */}
            <motion.section
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                Upload
              </h2>
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
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) loadFile(f);
                }}
                onClick={() => inputRef.current?.click()}
                className={`assignment-dropzone neon-glass-panel cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  dragOver
                    ? "border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_36px_rgba(0,212,255,0.2)]"
                    : "border-white/20 hover:border-[#6C63FF]/45"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) loadFile(f);
                  }}
                />
                <motion.div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF]/35 to-[#00D4FF]/25 text-2xl"
                  animate={dragOver ? { scale: 1.06 } : { scale: 1 }}
                >
                  📎
                </motion.div>
                <p className="font-medium text-white">Drop assignment here</p>
                <p className="mt-1 text-xs text-slate-500">Images · PDF · demo OCR pipeline</p>
              </div>

              {file && (
                <motion.div
                  className="neon-glass-panel overflow-hidden rounded-2xl p-3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative min-h-[160px] overflow-hidden rounded-xl bg-black/40">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Upload preview"
                        className={`max-h-56 w-full object-contain object-top ${scanning ? "opacity-90" : ""}`}
                      />
                    ) : (
                      <div className="flex min-h-[160px] items-center justify-center p-4 text-center text-sm text-slate-500">
                        <div>
                          <p className="font-medium text-slate-400">{file.name}</p>
                          <p className="mt-1 text-xs">{formatBytes(file.size)}</p>
                          <p className="mt-2 text-xs">Preview optimized for images — PDF uses icon mode.</p>
                        </div>
                      </div>
                    )}
                    <OCRScanOverlay active={scanning} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void runExtract();
                      }}
                      disabled={scanning}
                      className="btn-glow-primary flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                    >
                      {scanning ? "Scanning…" : "Extract questions"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.section>

            {/* Questions */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                Extracted questions
              </h2>
              <div className="neon-glass-panel mt-3 min-h-[280px] rounded-2xl p-4 xl:min-h-[420px]">
                <AnimatePresence mode="wait">
                  {questions.length === 0 ? (
                    <motion.p
                      key="empty-q"
                      className="py-12 text-center text-sm text-slate-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {scanning
                        ? "Extracting text regions…"
                        : "Upload a file and run extract to populate questions."}
                    </motion.p>
                  ) : (
                    <motion.ul
                      key="list-q"
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {questions.map((q, i) => (
                        <motion.li
                          key={i}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-slate-200"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.077 }}
                        >
                          <span className="font-semibold text-[#00D4FF]">Q{i + 1}.</span> {q}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Answers */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Answers
                </h2>
                <button
                  type="button"
                  disabled={questions.length === 0}
                  onClick={runSolve}
                  className="rounded-xl border border-[#6C63FF]/45 bg-[#6C63FF]/20 px-3 py-1.5 text-xs font-semibold text-violet-100 transition hover:bg-[#6C63FF]/30 disabled:opacity-40"
                >
                  Solve / re-type
                </button>
              </div>
              <div className="neon-glass-panel mt-3 min-h-[280px] rounded-2xl p-4 xl:min-h-[420px]">
                {questions.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">
                    Answers appear after questions are extracted.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {questions.map((_, i) => (
                      <div
                        key={`${solveKey}-${i}`}
                        className="rounded-xl border border-white/8 bg-black/25 p-3"
                      >
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6C63FF]">
                          Answer {i + 1}
                        </p>
                        <TypingAnswer
                          text={MOCK_ANSWERS[i] ?? "—"}
                          start={solveRun}
                          delayMs={i * 820}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default AssignmentSolver;
