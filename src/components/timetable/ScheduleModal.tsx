import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TimetableEventRecord } from "./subjects";
import { SUBJECTS, HOUR_START, HOUR_END, hourToLabel } from "./subjects";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: TimetableEventRecord | null;
  onSave: (e: Omit<TimetableEventRecord, "id"> & { id?: string }) => void;
};

const weekdays = [
  { v: 1, label: "Monday" },
  { v: 2, label: "Tuesday" },
  { v: 3, label: "Wednesday" },
  { v: 4, label: "Thursday" },
  { v: 5, label: "Friday" },
] as const;

const timeOptions = (() => {
  const opts: { value: number; label: string }[] = [];
  for (let h = HOUR_START; h < HOUR_END; h += 0.5) {
    opts.push({ value: h, label: hourToLabel(h) });
  }
  return opts;
})();

const durationOptions = [0.5, 1, 1.5, 2, 2.5, 3];

export const ScheduleModal = ({ open, onClose, initial, onSave }: Props) => {
  const [subjectId, setSubjectId] = useState(() => initial?.subjectId ?? SUBJECTS[0].id);
  const [title, setTitle] = useState(() => initial?.title ?? "");
  const [weekday, setWeekday] = useState<1 | 2 | 3 | 4 | 5>(() => initial?.weekday ?? 1);
  const [startHour, setStartHour] = useState(() => initial?.startHour ?? 9);
  const [duration, setDuration] = useState(() => initial?.duration ?? 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const sub = SUBJECTS.find((s) => s.id === subjectId);
    onSave({
      id: initial?.id,
      subjectId,
      title: title.trim() || sub?.name || "Session",
      weekday,
      startHour,
      duration,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="schedule-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            className="neon-glass-panel relative z-[1] w-full max-w-md rounded-2xl p-6 shadow-[0_0_80px_rgba(108,99,255,0.2)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(ev) => ev.stopPropagation()}
          >
        <h2 className="text-xl font-bold">{initial ? "Edit session" : "Add session"}</h2>
        <p className="mt-1 text-sm text-slate-400">Color follows subject — drag blocks on the week grid anytime.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(ev) => setSubjectId(ev.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/55"
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Title
            </label>
            <input
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#00D4FF]/45"
              placeholder="e.g. Tutorial — Room B12"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Day
              </label>
              <select
                value={weekday}
                onChange={(ev) => setWeekday(Number(ev.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/55"
              >
                {weekdays.map((d) => (
                  <option key={d.v} value={d.v} className="bg-slate-900">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Duration
              </label>
              <select
                value={duration}
                onChange={(ev) => setDuration(Number(ev.target.value))}
                className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/55"
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d} className="bg-slate-900">
                    {d} hr
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Start time
            </label>
            <select
              value={startHour}
              onChange={(ev) => setStartHour(Number(ev.target.value))}
              className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6C63FF]/55"
            >
              {timeOptions.map((t) => (
                <option key={t.value} value={t.value} className="bg-slate-900">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/8"
            >
              Cancel
            </button>
            <button type="submit" className="btn-glow-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
              {initial ? "Save changes" : "Add to timetable"}
            </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
