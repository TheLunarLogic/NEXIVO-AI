import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

import type { DocumentMeta } from "./documentChatApi";

export type SidebarFile = {
  id: string;
  file: File;
  meta?: DocumentMeta;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type DocumentFileSidebarProps = {
  files: SidebarFile[];
  onAdd: (list: File[]) => void;
  onRemove: (id: string) => void;
  onSearch?: (query: string) => void;
};

export const DocumentFileSidebar = ({ files, onAdd, onRemove, onSearch }: DocumentFileSidebarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pickFiles = useCallback(() => inputRef.current?.click(), []);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) onAdd(list);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (list.length) onAdd(list);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">Documents</h2>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">
        Upload documents for RAG. Max 20MB per file.
      </p>

      <form onSubmit={handleSearch} className="relative mt-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-3 pr-9 text-xs text-slate-200 outline-none focus:border-[#00D4FF]/40"
        />
        <button type="submit" className="absolute right-2 top-1.5 text-slate-500 hover:text-white">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </form>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        accept=".pdf,.txt,.md,.doc,.docx,.csv,.json,image/*"
        onChange={onChangeInput}
      />

      <button
        type="button"
        onClick={pickFiles}
        className="btn-glow-secondary mt-3 w-full rounded-xl py-2 text-xs font-semibold"
      >
        Upload File
      </button>

      <div
        role="presentation"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-4 flex min-h-[100px] flex-1 flex-col rounded-xl border border-dashed px-2 py-3 transition ${
          dragOver
            ? "border-[#00D4FF]/55 bg-[#00D4FF]/10"
            : "border-white/15 bg-white/[0.03]"
        }`}
      >
        <p className="text-center text-[10px] text-slate-600">Drop files here</p>
        <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {files.length === 0 ? (
            <li className="py-6 text-center text-[11px] text-slate-600 italic">No documents uploaded</li>
          ) : (
            files.map((f, index) => (
              <motion.li
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group relative flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.05] p-2.5 transition-colors hover:bg-white/[0.08]"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-base" aria-hidden>
                    📄
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">{f.file.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500">
                      <span>{formatBytes(f.file.size)}</span>
                      {f.meta && (
                        <>
                          <span className="text-slate-700">|</span>
                          <span>{f.meta.chunk_count} chunks</span>
                          {f.meta.upload_date && (
                            <>
                              <span className="text-slate-700">|</span>
                              <span>{f.meta.upload_date}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(f.id)}
                    className="shrink-0 rounded-lg p-1 text-slate-600 transition hover:bg-white/10 hover:text-rose-400"
                    aria-label={`Remove ${f.file.name}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
};
