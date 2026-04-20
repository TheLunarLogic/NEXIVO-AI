import { useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import {
  FlashcardDeck,
  type FlashcardData,
} from "../components/study/FlashcardDeck";
import { McqQuiz, type McqItem } from "../components/study/McqQuiz";
import { createDocumentChatApi } from "../components/documentChat/documentChatApi";

type Mode = "quiz" | "cards";

interface QuizQuestion {
  question: string;
  answer: string;
  explanation: string;
  difficulty: string;
}

const StudyQuiz = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
  const api = useRef(createDocumentChatApi(API_URL)).current;

  const [mode, setMode] = useState<Mode>("quiz");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(4);
  const [loading, setLoading] = useState(false);
  const [quizItems, setQuizItems] = useState<McqItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic name");
      return;
    }

    setLoading(true);
    setQuizItems([]);
    setFlashcards([]);

    try {
      const data = await api.generateQuiz(topic, numQuestions, "medium");
      const items = (data.quiz || []).map((q: QuizQuestion, idx: number) => ({
        ...q,
        id: `q-${idx}`,
      }));

      setQuizItems(items);
      setFlashcards(
        items.map((m: McqItem) => ({
          id: m.id,
          front: m.question,
          back: m.answer,
          explanation: m.explanation,
          difficulty: m.difficulty,
        })),
      );
      toast.success("Generation successful!");
    } catch (e) {
      toast.error("Failed to generate quiz. Check your connection.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="relative z-[1] max-w-5xl mx-auto pb-12">

          {/* Header Section */}
          <div className="relative z-[2] mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                Quiz & Flashcards
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                Generate personalized study material by entering a topic and
                quantity below.
              </p>
            </div>

            {/* Mode Switch Moved to Right */}
            <div className="flex w-fit items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              {(
                [
                  { id: "quiz" as const, label: "Quiz" },
                  { id: "cards" as const, label: "Flashcards" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMode(t.id)}
                  className={`relative px-6 py-2 text-xs font-bold uppercase tracking-wider transition sm:text-sm ${
                    mode === t.id
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mode === t.id && (
                    <motion.span
                      layoutId="study-tab"
                      className="absolute inset-0 rounded-xl bg-[#6C63FF]/30 shadow-[0_0_20px_rgba(108,99,255,0.2)]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-[1]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            {/* Generation Form */}
            <div className="relative z-[2]">
              <div className="neon-glass-panel rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Topic Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Machine Learning basics, Photosynthesis..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#6C63FF]/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#6C63FF]/50 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-glow-primary mt-6 w-full rounded-xl py-4 text-sm font-bold tracking-widest uppercase disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate Study Material"
                  )}
                </button>
              </div>

              {quizItems.length > 0 || loading ? (
                <div className="neon-glass-panel rounded-2xl p-6 min-h-[400px]">
                  {loading ? (
                    <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
                      <div className="h-12 w-12 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
                      <p className="text-sm text-slate-400">
                        Our AI is crafting your {topic} quiz...
                      </p>
                    </div>
                  ) : mode === "quiz" ? (
                    <McqQuiz items={quizItems} />
                  ) : (
                    <FlashcardDeck cards={flashcards} />
                  )}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                  <svg
                    className="h-12 w-12 text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-slate-500 font-medium">
                    Enter a topic above to get started
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar with Stats/Tips */}
            <aside className="hidden lg:block space-y-6">
              <div className="neon-glass-panel rounded-2xl p-5 border-l-4 border-l-[#00D4FF]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Study Tip
                </h4>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Switching between MCQ Quiz and Flashcards helps reinforce
                  different types of memory recall. Try the quiz first, then
                  review mistakes with flashcards!
                </p>
              </div>
              <div className="neon-glass-panel rounded-2xl p-5 border-l-4 border-l-[#6C63FF]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  AI Statistics
                </h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium lowercase">
                      Topics generated:
                    </span>
                    <span className="text-white font-mono">1,204</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium lowercase">
                      Avg accuracy:
                    </span>
                    <span className="text-[#00D4FF] font-mono">78%</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default StudyQuiz;
