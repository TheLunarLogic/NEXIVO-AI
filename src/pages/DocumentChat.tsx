import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { ChatTypingIndicator } from "../components/documentChat/ChatTypingIndicator";
import {
  DocumentFileSidebar,
  type SidebarFile,
} from "../components/documentChat/DocumentFileSidebar";
import {
  createDocumentChatApi,
  type DocumentMeta,
  type ThreadMessage,
} from "../components/documentChat/documentChatApi";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";

type ChatMessage = ThreadMessage & { id: string };

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const messageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const VoiceAssistantContent = ({ onDisconnect }: { onDisconnect: () => void }) => {
  const { state, audioTrack } = useVoiceAssistant();
  const isListening = state === "listening" || state === "thinking";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <div className="relative mb-4">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF]/40 to-[#00D4FF]/40 text-6xl shadow-xl">
          🤖
        </div>
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -inset-4 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/5 blur-xl"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex h-24 items-center justify-center">
        <BarVisualizer 
          state={state} 
          barCount={15} 
          trackRef={audioTrack}
          className="lk-voice-visualizer !gap-1.5"
        />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-white capitalize">
          {state === "idle" ? "Ready to speak?" : `AI is ${state}...`}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {isListening 
            ? "🎙 Mic is active — speak naturally." 
            : "Connect to start a real-time voice conversation."}
        </p>
      </div>

      <button
        type="button"
        onClick={onDisconnect}
        className="btn-glow-primary flex items-center gap-2 rounded-xl bg-rose-500/10 px-6 py-3 text-sm font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        End Conversation
      </button>
    </div>
  );
};

const DocumentChat = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
  const api = useRef(createDocumentChatApi(API_URL)).current;
  const DOC_THREAD_KEY = "docchat_thread_id";

  const [files, setFiles] = useState<SidebarFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: newId(),
      role: "assistant",
      content:
        "Hi — I am your Nexivo document assistant. Upload files on the left, then ask questions about them. Voice input works in supported browsers.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lkToken, setLkToken] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await api.fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error(e);
    }
  }, [api]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    const initThread = async () => {
      const saved = sessionStorage.getItem(DOC_THREAD_KEY);
      if (saved) {
        try {
          const hist = await api.fetchThreadMessages(saved);
          if (cancelled) return;
          setThreadId(saved);
          setMessages(
            hist.map((m) => ({
              id: m.id ?? newId(),
              role: m.role,
              content: m.content,
            })),
          );
          return;
        } catch {
          sessionStorage.removeItem(DOC_THREAD_KEY);
        }
      }

      const created = await api.startThread();
      if (cancelled) return;

      setThreadId(created.thread_id);
      sessionStorage.setItem(DOC_THREAD_KEY, created.thread_id);

      setMessages([
        {
          id: newId(),
          role: "assistant",
          content:
            "Hi — I am your Nexivo document assistant. Upload documents on the left, then ask questions.",
        },
      ]);
    };

    initThread().catch((e) => {
      console.error(e);
      toast.error("Could not initialize chat thread.");
    });

    refreshDocuments().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [DOC_THREAD_KEY, api, refreshDocuments]);


  const addFiles = useCallback(
    async (list: File[]) => {
      const newSidebarFiles = list.map((file) => ({ id: newId(), file }));
      setFiles((prev) => [...prev, ...newSidebarFiles]);

      if (list.length === 0) return;

      setUploading(true);
      try {
        for (const sf of newSidebarFiles) {
          await api.uploadDocument(sf.file);
          // After a successful upload, fetch the latest document list to get metadata
          const latestDocs = await api.fetchDocuments();
          const meta = latestDocs.find((d) => d.filename === sf.file.name);
          if (meta) {
            setFiles((prev) =>
              prev.map((item) => (item.id === sf.id ? { ...item, meta } : item)),
            );
          }
        }
        await refreshDocuments();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [api, refreshDocuments],
  );

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        await refreshDocuments();
        return;
      }
      try {
        const results = await api.searchKnowledgeBase(query);
        // If results contain specific documents, we could filter the sidebar or show a toast
        // For now, let's show a toast with the result summary if applicable
        console.log("Search results:", results);
        toast.success(`Search completed for: ${query}`);
      } catch (e) {
        toast.error("Search failed");
      }
    },
    [api, refreshDocuments],
  );

  const removeFile = useCallback(
    async (id: string) => {
      const toRemove = files.find((f) => f.id === id);
      if (!toRemove) return;

      // Optimistically remove from UI
      setFiles((prev) => prev.filter((f) => f.id !== id));

      // Best-effort delete: match by filename.
      const doc = documents.find((d) => d.filename === toRemove.file.name);
      if (!doc) return;

      try {
        await api.deleteDocument(doc.id);
        await refreshDocuments();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Delete failed";
        toast.error(msg);
      }
    },
    [api, documents, files, refreshDocuments],
  );

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || isTyping || uploading || !threadId) return;

    setDraft("");

    const userMsg: ChatMessage = { id: newId(), role: "user", content: text };
    const assistantId = newId();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setIsTyping(true);

    try {
      await api.streamAssistantReply({
        threadId,
        message: text,
        onDelta: (delta) => {
          setMessages((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev;
            updated[idx] = {
              ...updated[idx],
              content: updated[idx].content + delta,
            };
            return updated;
          });
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed";
      toast.error(msg);
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((m) => m.id === assistantId);
        if (idx === -1) return prev;
        updated[idx] = {
          ...updated[idx],
          content: "⚠ Failed to get response. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  }, [api, draft, isTyping, threadId, uploading]);

  const startVoiceSession = async () => {
    try {
      const data = await api.fetchToken();
      setLkToken(data.token);
    } catch (e) {
      toast.error("Failed to connect to voice server");
    }
  };

  const endVoiceSession = () => {
    setLkToken(null);
  };

  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="relative z-[1] flex min-h-[calc(100vh-8rem)] flex-col">
          <div className="relative z-[2] mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Document chat</h1>
              <p className="mt-1 text-sm text-slate-400">
                Ask questions about your documents using text or voice modes.
              </p>
            </div>
            <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["text", "voice"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setActiveTab(t);
                    if (t === "text" && lkToken) endVoiceSession();
                  }}
                  className={`relative rounded-xl px-4 py-2 text-xs font-medium capitalize transition sm:text-sm ${
                    activeTab === t ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {activeTab === t && (
                    <motion.span
                      layoutId="chat-tab"
                      className="absolute inset-0 rounded-xl bg-[#6C63FF]/35 shadow-[0_0_20px_rgba(108,99,255,0.25)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-[1]">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-[2] grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-6">
            <div className="min-h-[200px] lg:min-h-0">
              <DocumentFileSidebar 
                files={files} 
                onAdd={addFiles} 
                onRemove={removeFile} 
                onSearch={handleSearch}
              />
            </div>

            <section className="flex min-h-[min(560px,70vh)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-black/30 shadow-[0_0_40px_rgba(108,99,255,0.08)] backdrop-blur-md">
              <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6C63FF]">
                  {activeTab === "text" ? "Chat history" : "Voice assistant"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {uploading ? "Uploading…" : threadId ? "Connected to backend" : "Connecting…"}
                </span>
              </header>

              <div
                ref={scrollRef}
                className="doc-chat-scroll flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                {activeTab === "text" ? (
                  <div className="flex flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-5 flex-1">
                    {messages.map((m) => (
                      <motion.div
                        key={m.id}
                        variants={messageVariants}
                        initial="initial"
                        animate="animate"
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[min(100%,36rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            m.role === "user"
                              ? "rounded-br-md border border-[#6C63FF]/35 bg-[#6C63FF]/20 text-white"
                              : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200"
                          }`}
                        >
                          {m.role === "assistant" && (
                            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#00D4FF]/90">
                              Assistant
                            </span>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </motion.div>
                    ))}

                    <AnimatePresence mode="popLayout">
                      {isTyping ? <ChatTypingIndicator key="typing" /> : null}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex h-full flex-col overflow-hidden">
                    {!lkToken ? (
                      <div className="flex h-full flex-col items-center justify-center gap-8 p-6 text-center">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF]/40 to-[#00D4FF]/40 text-6xl shadow-xl">
                          🤖
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Voice Assistant</h3>
                          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
                            Transform your documents into a real-time voice conversation.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={startVoiceSession}
                          className="btn-glow-primary rounded-xl px-10 py-4 text-sm font-bold tracking-wide"
                        >
                          Start Voice Conversation
                        </button>
                      </div>
                    ) : (
                      <LiveKitRoom
                        serverUrl={import.meta.env.VITE_LIVEKIT_URL}
                        token={lkToken}
                        connect={true}
                        audio={true}
                        video={false}
                        onDisconnected={endVoiceSession}
                        className="flex flex-1 flex-col"
                      >
                        <RoomAudioRenderer />
                        <VoiceAssistantContent onDisconnect={endVoiceSession} />
                      </LiveKitRoom>
                    )}
                  </div>
                )}
              </div>

              {activeTab === "text" && (
                <footer className="border-t border-white/10 p-3 sm:p-4">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      rows={1}
                      placeholder="Message about your documents…"
                      className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                      disabled={isTyping || uploading}
                    />

                    <button
                      type="button"
                      onClick={send}
                      disabled={isTyping || uploading || !draft.trim()}
                      className="btn-glow-primary h-11 w-11 shrink-0 rounded-xl p-0 flex items-center justify-center disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-slate-600">
                    Enter to send · Shift+Enter for newline
                  </p>
                </footer>
              )}
            </section>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default DocumentChat;
