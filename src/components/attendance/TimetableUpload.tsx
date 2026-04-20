
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onUpload: (file: File) => void;
}

export const TimetableUpload = ({ onUpload }: Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <div
      className={`relative h-40 rounded-2xl border-2 border-dashed transition-all duration-300 ${
        dragActive
          ? "border-[#00D4FF] bg-[#00D4FF]/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleChange}
      />
      
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <div className="mb-2 text-3xl">📅</div>
        <AnimatePresence mode="wait">
          {fileName ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-medium text-[#00D4FF]"
            >
              Selected: {fileName}
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1"
            >
              <p className="text-sm text-slate-300">
                Drag and drop your timetable here
              </p>
              <p className="text-xs text-slate-500">
                Supports Images and PDFs
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 text-xs font-semibold text-[#6C63FF] hover:underline"
              >
                or browse files
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {dragActive && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-[#00D4FF]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </div>
  );
};
