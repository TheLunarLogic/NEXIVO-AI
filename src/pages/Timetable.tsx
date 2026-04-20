import { useCallback, useMemo, useRef, useState, type ChangeEventHandler } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { NotificationPreview } from "../components/timetable/NotificationPreview";
import { ScheduleModal } from "../components/timetable/ScheduleModal";
import { WeeklyScheduleGrid } from "../components/timetable/WeeklyScheduleGrid";
import type { TimetableEventRecord } from "../components/timetable/subjects";
import { subjectById } from "../components/timetable/subjects";

const INITIAL_EVENTS: TimetableEventRecord[] = [
  {
    id: "e1",
    subjectId: "math",
    title: "Linear Algebra",
    weekday: 1,
    startHour: 9,
    duration: 1.5,
  },
  {
    id: "e2",
    subjectId: "chem",
    title: "Organic Chem Lab",
    weekday: 2,
    startHour: 11,
    duration: 2,
  },
  {
    id: "e3",
    subjectId: "cs",
    title: "Data Structures",
    weekday: 3,
    startHour: 14,
    duration: 1,
  },
  {
    id: "e4",
    subjectId: "phys",
    title: "Mechanics",
    weekday: 4,
    startHour: 10,
    duration: 1,
  },
  {
    id: "e5",
    subjectId: "lit",
    title: "Modern Poetry",
    weekday: 5,
    startHour: 13,
    duration: 1.5,
  },
];

function buildMonthCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Timetable = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [events, setEvents] = useState<TimetableEventRecord[]>(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cursorMonth, setCursorMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const uploadRef = useRef<HTMLInputElement>(null);
  const [notifyOn, setNotifyOn] = useState(true);

  const editing = useMemo(
    () => events.find((e) => e.id === editingId) ?? null,
    [events, editingId],
  );

  const nextClass = useMemo(() => {
    const monFirst = events[0];
    return monFirst ?? null;
  }, [events]);

  const notifyPreview = useMemo(() => {
    if (!nextClass) {
      return { title: "", subtitle: "", color: "#6C63FF" };
    }
    const sub = subjectById(nextClass.subjectId);
    return {
      title: `${nextClass.title} · ${sub.name}`,
      subtitle: "Starts in 15 minutes · Room notification preview",
      color: sub.color,
    };
  }, [nextClass]);

  const monthCells = useMemo(
    () => buildMonthCells(cursorMonth.getFullYear(), cursorMonth.getMonth()),
    [cursorMonth],
  );

  const eventsForDay = useCallback(
    (year: number, month: number, day: number) => {
      const d = new Date(year, month, day);
      const wd = d.getDay();
      if (wd === 0 || wd === 6) return [];
      return events.filter((e) => e.weekday === wd);
    },
    [events],
  );

  const persistMove = (id: string, weekday: 1 | 2 | 3 | 4 | 5, startHour: number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, weekday, startHour } : e)),
    );
    toast.success("Session moved", { duration: 2000, icon: "✨" });
  };

  const saveModal = (payload: Omit<TimetableEventRecord, "id"> & { id?: string }) => {
    if (payload.id) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === payload.id
            ? {
                ...e,
                subjectId: payload.subjectId,
                title: payload.title,
                weekday: payload.weekday,
                startHour: payload.startHour,
                duration: payload.duration,
              }
            : e,
        ),
      );
      toast.success("Session updated");
    } else {
      const id = `e-${Date.now()}`;
      setEvents((prev) => [
        ...prev,
        {
          id,
          subjectId: payload.subjectId,
          title: payload.title,
          weekday: payload.weekday,
          startHour: payload.startHour,
          duration: payload.duration,
        },
      ]);
      toast.success("Session added");
    }
  };

  const handleUpload: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 900)),
      {
        loading: `Parsing ${file.name}…`,
        success: `Imported timetable preview from ${file.name}`,
        error: "Could not parse file",
      },
    );
  };

  const shiftMonth = (delta: number) => {
    setCursorMonth((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <DashboardLayout>
        <div className="relative">

          <NotificationPreview
            visible={notifyOn && view === "week"}
            title={notifyPreview.title || "No upcoming class"}
            subtitle={notifyPreview.subtitle}
            subjectColor={notifyPreview.color}
          />

          <div className="relative z-[1] mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Smart timetable</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-400">
                Weekly and monthly views, color-coded subjects, drag sessions to reschedule, and
                upload a file to sync your calendar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setView("week")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    view === "week" ? "bg-[#6C63FF]/35 text-white shadow-[0_0_16px_rgba(108,99,255,0.25)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setView("month")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    view === "month" ? "bg-[#6C63FF]/35 text-white shadow-[0_0_16px_rgba(108,99,255,0.25)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Month
                </button>
              </div>
              <button
                type="button"
                onClick={() => setNotifyOn((v) => !v)}
                className={`neon-icon-btn rounded-xl px-3 py-2 text-xs font-medium transition sm:text-sm ${
                  notifyOn ? "border-[#00D4FF]/40 text-[#CFF9FF]" : "text-slate-400"
                }`}
              >
                {notifyOn ? "Preview on" : "Preview off"}
              </button>
              <input
                ref={uploadRef}
                type="file"
                accept=".ics,.csv,application/pdf,image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="neon-icon-btn rounded-xl px-3 py-2 text-xs font-medium text-slate-200 transition hover:text-white sm:text-sm"
              >
                Upload timetable
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setModalOpen(true);
                }}
                className="btn-glow-primary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Add session
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === "week" ? (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-[1]"
              >
                <div className="dashboard-float-card neon-glass-panel mb-4 rounded-2xl p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#00D4FF]">
                    This week
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Drag blocks horizontally or vertically — times snap to 30 minutes.
                  </p>
                </div>
                <div className="dashboard-float-card neon-glass-panel rounded-2xl p-3 sm:p-4">
                  <WeeklyScheduleGrid
                    events={events}
                    onEventMove={persistMove}
                    onEventClick={(id) => {
                      setEditingId(id);
                      setModalOpen(true);
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-[1]"
              >
                <div className="dashboard-float-card neon-glass-panel mb-4 flex items-center justify-between rounded-2xl p-4">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="neon-icon-btn rounded-lg px-3 py-2 text-sm text-slate-300"
                    aria-label="Previous month"
                  >
                    ←
                  </button>
                  <h2 className="text-lg font-semibold">
                    {MONTH_NAMES[cursorMonth.getMonth()]} {cursorMonth.getFullYear()}
                  </h2>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="neon-icon-btn rounded-lg px-3 py-2 text-sm text-slate-300"
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>
                <div className="dashboard-float-card neon-glass-panel rounded-2xl p-3 sm:p-5">
                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthCells.map((cell, idx) => {
                      const y = cursorMonth.getFullYear();
                      const m = cursorMonth.getMonth();
                      const dayEvents =
                        cell !== null ? eventsForDay(y, m, cell) : [];
                      const isWeekend =
                        cell !== null &&
                        [0, 6].includes(new Date(y, m, cell).getDay());

                      return (
                        <motion.div
                          key={idx}
                          className={`min-h-[4.5rem] rounded-xl border p-1 sm:min-h-[5.5rem] sm:p-1.5 ${
                            cell === null
                              ? "border-transparent bg-transparent"
                              : isWeekend
                                ? "border-white/5 bg-white/[0.02]"
                                : "border-white/10 bg-white/[0.04]"
                          }`}
                          whileHover={cell ? { scale: 1.02 } : {}}
                        >
                          {cell !== null && (
                            <>
                              <p
                                className={`text-xs font-semibold sm:text-sm ${
                                  isWeekend ? "text-slate-600" : "text-slate-200"
                                }`}
                              >
                                {cell}
                              </p>
                              <div className="mt-1 flex flex-col gap-0.5">
                                {dayEvents.slice(0, 3).map((ev) => {
                                  const sub = subjectById(ev.subjectId);
                                  return (
                                    <motion.button
                                      type="button"
                                      key={ev.id}
                                      className="w-full truncate rounded-md px-1 py-0.5 text-left text-[9px] font-medium text-white sm:text-[10px]"
                                      style={{
                                        background: `${sub.color}55`,
                                        boxShadow: `0 0 8px ${sub.glow}`,
                                      }}
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => {
                                        setEditingId(ev.id);
                                        setModalOpen(true);
                                      }}
                                    >
                                      {ev.title}
                                    </motion.button>
                                  );
                                })}
                                {dayEvents.length > 3 && (
                                  <span className="text-[9px] text-slate-500">
                                    +{dayEvents.length - 3}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>

      <ScheduleModal
        key={`${modalOpen}-${editingId ?? "__new__"}`}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        initial={editing}
        onSave={saveModal}
      />
    </motion.div>
  );
};

export default Timetable;
