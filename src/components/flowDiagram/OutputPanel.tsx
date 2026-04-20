/* ───────────────────────────────────────────────────────────
 *  Output Panel — Code · Explanation · Dry Run
 *
 *  Sits on the right side of the split-screen layout.
 *  Receives the API response and renders the active tab.
 * ─────────────────────────────────────────────────────────── */

import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  LANGUAGES,
  type LangId,
  type OutputTab,
  type FlowToCodeResponse,
} from "./flowDiagramTypes";

/* ── editor style override ───────────────────────────────── */

const editorStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "#0d1117",
    margin: 0,
    borderRadius: "0.75rem",
    padding: "1rem",
    fontSize: "13px",
    lineHeight: 1.55,
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

/* ── sub-components ──────────────────────────────────────── */

const fadeVariants = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
};

function CodeView({
  code,
  lang,
}: {
  code: Record<LangId, string>;
  lang: LangId;
}) {
  const prismLang = LANGUAGES.find((l) => l.id === lang)?.prism ?? "c";
  return (
    <motion.div key={lang} {...fadeVariants} transition={{ duration: 0.3 }}>
      <div className="overflow-hidden rounded-2xl border border-[#30363d] shadow-[0_0_40px_rgba(108,99,255,0.12)]">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
          <span className="ml-2 text-[10px] text-slate-500">
            output.{lang === "cpp" ? "cpp" : lang === "python" ? "py" : lang}
          </span>
        </div>
        {/* code */}
        <div className="max-h-[55vh] overflow-auto bg-[#0d1117]">
          <SyntaxHighlighter
            language={prismLang}
            style={editorStyle}
            showLineNumbers
            wrapLines
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, maxHeight: "none" }}
          >
            {code[lang] || "// No code generated yet."}
          </SyntaxHighlighter>
        </div>
      </div>
    </motion.div>
  );
}

function ExplanationView({ steps }: { steps: string[] }) {
  return (
    <motion.ol
      className="space-y-3"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
    >
      {steps.map((step, i) => (
        <motion.li
          key={i}
          variants={fadeVariants}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-slate-200"
        >
          <span className="mr-2 font-semibold text-[#00D4FF]">{i + 1}.</span>
          {step.replace(/^Step \d+:\s*/i, "")}
        </motion.li>
      ))}
    </motion.ol>
  );
}

function DryRunView({
  dryRun,
}: {
  dryRun: FlowToCodeResponse["dryRun"];
}) {
  return (
    <motion.div
      className="space-y-4"
      {...fadeVariants}
      transition={{ duration: 0.35 }}
    >
      {/* input */}
      <div className="rounded-xl border border-[#00D4FF]/25 bg-[#00D4FF]/[0.06] p-4">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#00D4FF]">
          Input
        </div>
        <p className="text-sm text-slate-200">{dryRun.input}</p>
      </div>

      {/* steps */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Execution Trace
        </div>
        <ol className="space-y-2">
          {dryRun.steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-2 text-sm text-slate-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#6C63FF]/20 text-[10px] font-bold text-[#6C63FF]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{s}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* output */}
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400">
          Output
        </div>
        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200">
          {dryRun.output}
        </pre>
      </div>
    </motion.div>
  );
}

/* ── main panel ──────────────────────────────────────────── */

interface OutputPanelProps {
  response: FlowToCodeResponse | null;
  loading: boolean;
  error: string | null;
  activeTab: OutputTab;
  setActiveTab: (t: OutputTab) => void;
  language: LangId;
  setLanguage: (l: LangId) => void;
}

const TABS: { id: OutputTab; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "explanation", label: "Explanation" },
  { id: "dryrun", label: "Dry Run" },
];

export const OutputPanel = ({
  response,
  loading,
  error,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
}: OutputPanelProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* ── top bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
        {/* tabs */}
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === t.id
                  ? "border-[#00D4FF]/40 bg-[#00D4FF]/15 text-white shadow-[0_0_20px_rgba(0,212,255,0.12)]"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* language selector (only for code tab) */}
        {activeTab === "code" && (
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangId)}
            className="rounded-xl border border-white/12 bg-black/35 px-3 py-1.5 text-xs text-white outline-none focus:border-[#6C63FF]/45"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-slate-900">
                {l.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── content area ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <motion.div
              className="h-12 w-12 rounded-full border-2 border-[#6C63FF]/30 border-t-[#00D4FF]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-slate-400">Generating code…</p>
          </div>
        )}

        {/* error */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] px-5 py-6 text-center">
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        )}

        {/* empty state */}
        {!loading && !error && !response && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-slate-500">
            <motion.span
              className="text-4xl"
              animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨
            </motion.span>
            <p className="max-w-xs text-sm">
              Build a flow diagram on the left, then click{" "}
              <span className="font-semibold text-[#00D4FF]">Convert</span> to
              see generated code, explanations, and a dry run here.
            </p>
          </div>
        )}

        {/* results */}
        {!loading && !error && response && (
          <AnimatePresence mode="wait">
            {activeTab === "code" && (
              <CodeView key="code" code={response.code} lang={language} />
            )}
            {activeTab === "explanation" && (
              <ExplanationView
                key="explanation"
                steps={response.explanation}
              />
            )}
            {activeTab === "dryrun" && (
              <DryRunView key="dryrun" dryRun={response.dryRun} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
