import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", prism: "javascript" },
  { id: "typescript", label: "TypeScript", prism: "typescript" },
  { id: "python", label: "Python", prism: "python" },
  { id: "cpp", label: "C++", prism: "cpp" },
  { id: "java", label: "Java", prism: "java" },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];

const MOCK_CODE: Record<LangId, string> = {
  javascript: `/**
 * Nexivo Lab — Two Sum (demo)
 * O(n) time with a hash map
 */
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

module.exports = { twoSum };`,

  typescript: `/**
 * Nexivo Lab — typed two-sum
 */
export function twoSum(nums: number[], target: number): [number, number] | [] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]!;
    const j = seen.get(need);
    if (j !== undefined) return [j, i];
    seen.set(nums[i]!, i);
  }
  return [];
}`,

  python: `"""Nexivo Lab — two sum in Python."""


def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, n in enumerate(nums):
        need = target - n
        if need in seen:
            return [seen[need], i]
        seen[n] = i
    return []`,

  cpp: `// Nexivo Lab — C++17 two sum
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        int need = target - nums[i];
        auto it = seen.find(need);
        if (it != seen.end()) {
            return {it->second, i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,

  java: `// Nexivo Lab — Java
import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[] { seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
};

const TYPING_MS = 11;

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
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

const ProgrammingLab = () => {
  const [question, setQuestion] = useState(
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  );
  const [language, setLanguage] = useState<LangId>("javascript");
  const [displayedCode, setDisplayedCode] = useState("");
  const [typingRun, setTypingRun] = useState(0);

  const prismLang = useMemo(
    () => LANGUAGES.find((l) => l.id === language)?.prism ?? "javascript",
    [language],
  );

  const fullCode = MOCK_CODE[language];

  useEffect(() => {
    if (typingRun === 0) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDisplayedCode(fullCode.slice(0, i));
      if (i >= fullCode.length) window.clearInterval(id);
    }, TYPING_MS);
    return () => window.clearInterval(id);
  }, [typingRun, fullCode]);

  const startTyping = () => {
    setDisplayedCode("");
    setTypingRun((r) => r + 1);
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


          <div className="relative z-[2] mb-8 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Programming lab</h1>
            <p className="mt-1 text-sm text-slate-400">
              Describe a problem, pick a language, and watch a reference solution type itself into a
              dark, syntax-highlighted editor.
            </p>
          </div>

          <div className="relative z-[2] grid gap-6 lg:grid-cols-2 lg:gap-8">
            <motion.section
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="neon-glass-panel rounded-2xl p-5">
                <label htmlFor="lab-question" className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Question
                </label>
                <textarea
                  id="lab-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={8}
                  className="mt-3 w-full resize-y rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                  placeholder="Paste your programming question or prompt…"
                />
                <label htmlFor="lab-lang" className="mt-4 block text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Language
                </label>
                <select
                  id="lab-lang"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as LangId);
                    setDisplayedCode("");
                    setTypingRun(0);
                  }}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-[#00D4FF]/45"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-900">
                      {l.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={startTyping}
                  className="btn-glow-primary mt-5 w-full rounded-xl py-3 text-sm font-semibold"
                >
                  Generate solution (demo)
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  Demo uses a fixed Two Sum scaffold per language. Connect your model API to answer
                  arbitrary questions.
                </p>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Code output
                </h2>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400">
                  {prismLang}
                </span>
              </div>
              <div className="programming-editor-shell overflow-hidden rounded-2xl border border-[#30363d] shadow-[0_0_40px_rgba(108,99,255,0.12)]">
                <div className="flex items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                  <span className="ml-2 text-[10px] text-slate-500">
                    {`nexivo-lab.${
                      language === "cpp"
                        ? "cpp"
                        : language === "typescript"
                          ? "ts"
                          : language === "javascript"
                            ? "js"
                            : language === "python"
                              ? "py"
                              : "java"
                    }`}
                  </span>
                </div>
                <div className="max-h-[min(520px,55vh)] overflow-auto bg-[#0d1117]">
                  {typingRun === 0 && displayedCode.length === 0 ? (
                    <p className="p-6 font-mono text-sm text-slate-500">
                      Run generate to stream syntax-highlighted code here.
                    </p>
                  ) : (
                    <SyntaxHighlighter
                      language={prismLang}
                      style={editorStyle}
                      showLineNumbers
                      wrapLines
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        maxHeight: "none",
                      }}
                    >
                      {displayedCode.length > 0 ? displayedCode : " "}
                    </SyntaxHighlighter>
                  )}
                </div>
                {typingRun > 0 && displayedCode.length < fullCode.length && (
                  <motion.div
                    className="flex items-center gap-2 border-t border-[#30363d] bg-[#161b22] px-3 py-2 text-[10px] text-slate-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-[#00D4FF]"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                    Typing…
                  </motion.div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default ProgrammingLab;
