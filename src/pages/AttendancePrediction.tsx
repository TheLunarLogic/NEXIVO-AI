import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { TimetableUpload } from "../components/attendance/TimetableUpload";
import {
  calculateForecast,
  type Weekday,
  type ForecastResult,
  type TimetableEntry,
} from "../components/attendance/predictionEngine";
import {
  projectSubject,
  weightedAverage,
  type SubjectAttendanceRow,
} from "../components/attendance/prediction";

const defaultRows: SubjectAttendanceRow[] = [
  {
    id: "1",
    name: "Linear Algebra",
    attended: 34,
    absent: 2,
    remaining: 14,
    extraPlannedMiss: 0,
  },
  {
    id: "2",
    name: "Organic Chemistry",
    attended: 28,
    absent: 4,
    remaining: 18,
    extraPlannedMiss: 1,
  },
  {
    id: "3",
    name: "Data Structures",
    attended: 40,
    absent: 0,
    remaining: 10,
    extraPlannedMiss: 0,
  },
];

const WEEKDAYS: { label: string; value: Weekday }[] = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

function trajectoryPoints(from: number, to: number, steps: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(from + (to - from) * t);
  }
  return pts;
}

const AttendancePrediction = () => {
  const [rows, setRows] = useState<SubjectAttendanceRow[]>(defaultRows);
  const [leaveDates, setLeaveDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  
  // New States
  const [absentWeekdays, setAbsentWeekdays] = useState<Set<Weekday>>(new Set());
  const [termEndDate, setTermEndDate] = useState("2026-05-30");
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [forecasts, setForecasts] = useState<Record<string, ForecastResult>>({});
  const [showForecast, setShowForecast] = useState(false);

  // Initialize a mock timetable based on current subjects if none exists
  useEffect(() => {
    if (timetable.length === 0 && rows.length > 0) {
      const mock: TimetableEntry[] = [];
      rows.forEach((r, idx) => {
        const days: Weekday[] = [(idx % 5) + 1, ((idx + 2) % 5) + 1] as Weekday[];
        days.forEach(d => mock.push({ subjectId: r.id, dayOfWeek: d }));
      });
      setTimetable(mock);
    }
  }, [rows, timetable.length]);

  const toggleWeekday = (day: Weekday) => {
    setAbsentWeekdays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handlePredict = async () => {
    setPredicting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nextForecasts: Record<string, ForecastResult> = {};
    rows.forEach(row => {
      nextForecasts[row.id] = calculateForecast({
        currentAttended: row.attended,
        currentAbsent: row.absent,
        absentWeekdays,
        specificHolidays: leaveDates,
        termEndDate,
        timetable,
        subjectId: row.id,
      });
    });
    
    setForecasts(nextForecasts);
    setShowForecast(true);
    setPredicting(false);
    toast.success("Attendance prediction updated!");
  };

  const [hovered, setHovered] = useState<{
    id: string;
    kind: "current" | "projected";
  } | null>(null);

  const projections = useMemo(
    () => rows.map((r) => {
      const p = projectSubject(r, 0); // Base projection
      const f = forecasts[r.id];
      if (f) {
        return {
          ...p,
          projectedPct: f.projectedPct,
          plannedMiss: f.missedFutureSessions,
        };
      }
      return p;
    }),
    [rows, forecasts],
  );

  const overallCurrent = useMemo(() => {
    const items = projections
      .filter((p) => p.doneSessions > 0)
      .map((p) => ({ value: p.currentPct, weight: p.doneSessions }));
    return weightedAverage(items);
  }, [projections]);

  const overallProjected = useMemo(() => {
    const items = projections
      .filter((p) => p.totalSessions > 0)
      .map((p) => ({ value: p.projectedPct, weight: p.totalSessions }));
    return weightedAverage(items);
  }, [projections]);

  const minProjected = useMemo(() => {
    if (projections.length === 0) return 0;
    return Math.min(...projections.map((p) => p.projectedPct));
  }, [projections]);

  const linePoints = useMemo(
    () => trajectoryPoints(overallCurrent, overallProjected, 10),
    [overallCurrent, overallProjected],
  );

  const rings = useMemo(
    () => [
      {
        label: "Weighted current",
        value: overallCurrent,
        color: "#00D4FF",
        glow: "rgba(0,212,255,0.35)",
      },
      {
        label: "Projected",
        value: overallProjected,
        color: "#6C63FF",
        glow: "rgba(108,99,255,0.4)",
      },
      {
        label: "Floor (min)",
        value: minProjected,
        color: "#FF6B6B",
        glow: "rgba(255,107,107,0.35)",
      },
    ],
    [overallCurrent, overallProjected, minProjected],
  );

  const updateRow = (id: string, patch: Partial<SubjectAttendanceRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const patchRowField = (
    id: string,
    field: keyof Pick<
      SubjectAttendanceRow,
      "attended" | "absent" | "remaining" | "extraPlannedMiss"
    >,
    raw: number,
  ) => {
    const n = Math.max(0, Number.isFinite(raw) ? raw : 0);
    updateRow(id, { [field]: n } as Partial<SubjectAttendanceRow>);
  };

  const addLeave = () => {
    if (!dateInput) return;
    if (leaveDates.includes(dateInput)) return;
    setLeaveDates((d) => [...d, dateInput].sort());
    setDateInput("");
  };

  const removeLeave = (iso: string) => {
    setLeaveDates((d) => d.filter((x) => x !== iso));
  };

  const chartW = 560;
  const chartH = 200;
  const pad = 36;
  const maxVal = 100;

  const pathD = useMemo(() => {
    if (linePoints.length < 2) return "";
    const innerW = chartW - pad * 2;
    const innerH = chartH - pad * 2;
    return linePoints
      .map((v, i) => {
        const x = pad + (i / (linePoints.length - 1)) * innerW;
        const y = pad + innerH - (v / maxVal) * innerH;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [linePoints]);

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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Attendance prediction
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Tune sessions per subject, add planned leave days, and watch projections update in
              real time with animated charts and glow metrics.
            </p>
          </div>

          <div className="relative z-[2] grid gap-6 xl:grid-cols-[1fr_1.05fr]">
            <div className="space-y-5">
              <motion.section
                className="neon-glass-panel rounded-2xl p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-lg font-semibold">Subjects & attendance</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Attended / absent so far, remaining sessions, and extra planned misses for this
                  course.
                </p>
                <div className="mt-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {rows.map((row, idx) => (
                      <motion.div
                        key={row.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border border-white/10 bg-black/25 p-4"
                      >
                        <input
                          value={row.name}
                          onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          className="mb-3 w-full border-b border-white/10 bg-transparent pb-1 text-sm font-semibold text-white outline-none focus:border-[#00D4FF]/50"
                          aria-label={`Subject ${idx + 1} name`}
                        />
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {(
                            [
                              ["attended", "Attended", row.attended],
                              ["absent", "Absent", row.absent],
                              ["remaining", "Remaining", row.remaining],
                              [
                                "extraPlannedMiss",
                                "Extra misses",
                                row.extraPlannedMiss,
                              ],
                            ] as const
                          ).map(([key, label, val]) => (
                            <label key={key} className="block text-xs text-slate-500">
                              {label}
                              <input
                                type="number"
                                min={0}
                                value={val}
                                onChange={(e) =>
                                  patchRowField(
                                    row.id,
                                    key,
                                    Number.parseInt(e.target.value, 10) || 0,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-white/12 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-[#6C63FF]/45"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="attendance-glow-progress mt-3">
                          <div className="mb-1 flex justify-between text-[10px] uppercase text-slate-500">
                            <span>Current</span>
                            <span>
                              {Math.round(projections.find((p) => p.id === row.id)?.currentPct ?? 0)}%
                            </span>
                          </div>
                          <motion.div
                            className="h-2 overflow-hidden rounded-full bg-white/10"
                            layout
                          >
                            <motion.div
                              className="attendance-progress-fill h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#6C63FF]"
                              initial={false}
                              animate={{
                                width: `${projections.find((p) => p.id === row.id)?.currentPct ?? 0}%`,
                              }}
                              transition={{ type: "spring", stiffness: 120, damping: 18 }}
                            />
                          </motion.div>
                          <div className="mb-1 mt-2 flex justify-between text-[10px] uppercase text-slate-500">
                            <span>Projected</span>
                            <span>
                              {Math.round(projections.find((p) => p.id === row.id)?.projectedPct ?? 0)}
                              %
                            </span>
                          </div>
                          <motion.div
                            className="h-2 overflow-hidden rounded-full bg-white/10"
                            layout
                          >
                            <motion.div
                              className="attendance-progress-fill h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B]"
                              initial={false}
                              animate={{
                                width: `${projections.find((p) => p.id === row.id)?.projectedPct ?? 0}%`,
                              }}
                              transition={{ type: "spring", stiffness: 120, damping: 18 }}
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>

              <motion.section
                className="neon-glass-panel rounded-2xl p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Absence Planning</h2>
                  <button
                    type="button"
                    onClick={handlePredict}
                    disabled={predicting}
                    className="btn-glow-primary flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {predicting ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                      "📊"
                    )}
                    {predicting ? "Predicting..." : "Predict Attendance"}
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Timetable Upload
                      </h3>
                      <TimetableUpload onUpload={(file) => console.log("Uploaded:", file)} />
                    </div>
                    
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Term End Date
                      </h3>
                      <input
                        type="date"
                        value={termEndDate}
                        onChange={(e) => setTermEndDate(e.target.value)}
                        className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00D4FF]/45"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Recurring Absences
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWeekday(day.value)}
                            className={`rounded-lg border px-2 py-2 text-[10px] font-bold uppercase transition-all ${
                              absentWeekdays.has(day.value)
                                ? "border-[#FF6B6B] bg-[#FF6B6B]/20 text-[#FFC9C9]"
                                : "border-white/10 bg-white/5 text-slate-500 hover:border-white/25"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Manual Leaves
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={dateInput}
                          onChange={(e) => setDateInput(e.target.value)}
                          className="flex-1 rounded-xl border border-white/12 bg-white/5 px-2 py-2 text-xs text-white outline-none focus:border-[#00D4FF]/45"
                        />
                        <button
                          type="button"
                          onClick={addLeave}
                          className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase hover:bg-white/20"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {leaveDates.map((d) => (
                          <motion.span
                            key={d}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400"
                          >
                            {d}
                            <button onClick={() => removeLeave(d)} className="hover:text-white">×</button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showForecast && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-6 overflow-hidden border-t border-white/10 pt-6"
                    >
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#00D4FF]">
                        Predicted Outlook
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {Object.entries(forecasts).map(([id, f]) => {
                          const rowName = rows.find(r => r.id === id)?.name;
                          return (
                            <div key={id} className="rounded-xl bg-white/5 p-3 border border-white/5">
                              <div className="text-[10px] text-slate-500 mb-1 truncate">{rowName}</div>
                              <div className="text-lg font-bold text-white tabular-nums">
                                {Math.round(f.projectedPct)}%
                              </div>
                              <div className="mt-1 text-[9px] text-slate-600">
                                {f.missedFutureSessions} misses / {f.totalFutureSessions} sessions
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            </div>

            <div className="space-y-5">
              <motion.section
                className="neon-glass-panel relative rounded-2xl p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <h2 className="text-lg font-semibold">Trajectory</h2>
                <p className="text-xs text-slate-500">
                  Interpolated path from weighted current to weighted projected — hover points.
                </p>
                <div className="relative mt-4 overflow-x-auto">
                  <svg
                    width={chartW}
                    height={chartH}
                    className="mx-auto min-w-0"
                    onMouseLeave={() => setHovered(null)}
                  >
                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="100%" stopColor="#6C63FF" />
                      </linearGradient>
                    </defs>
                    {linePoints.map((_, i) => {
                      if (i === 0) return null;
                      const innerW = chartW - pad * 2;
                      const x = pad + (i / (linePoints.length - 1)) * innerW;
                      return (
                        <line
                          key={`g-${i}`}
                          x1={x}
                          y1={pad}
                          x2={x}
                          y2={chartH - pad}
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="4 6"
                        />
                      );
                    })}
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth={3}
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } }}
                      style={{ filter: "drop-shadow(0 0 10px rgba(108,99,255,0.45))" }}
                    />
                    {linePoints.map((v, i) => {
                      const innerW = chartW - pad * 2;
                      const innerH = chartH - pad * 2;
                      const x = pad + (i / Math.max(1, linePoints.length - 1)) * innerW;
                      const y = pad + innerH - (v / maxVal) * innerH;
                      const active = hovered?.id === `pt-${i}`;
                      return (
                        <motion.circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={active ? 8 : 5}
                          fill={i === linePoints.length - 1 ? "#6C63FF" : "#00D4FF"}
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth={1}
                          className="cursor-pointer"
                          whileHover={{ r: 9 }}
                          onMouseEnter={() => setHovered({ id: `pt-${i}`, kind: "projected" })}
                          style={{
                            filter: active
                              ? "drop-shadow(0 0 12px rgba(0,212,255,0.8))"
                              : undefined,
                          }}
                        />
                      );
                    })}
                  </svg>
                  {hovered?.id.startsWith("pt-") && (
                    <motion.div
                      className="pointer-events-none absolute right-4 top-2 rounded-lg border border-white/15 bg-slate-950/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="text-slate-400">Step </span>
                      <span className="font-mono text-white">
                        {hovered.id.replace("pt-", "")}
                      </span>
                      <span className="text-slate-400"> → </span>
                      <span className="font-semibold text-[#00D4FF]">
                        {Math.round(linePoints[Number(hovered.id.replace("pt-", ""))] ?? 0)}%
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.section>

              <motion.section
                className="neon-glass-panel rounded-2xl p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-semibold">Current vs projected</h2>
                <p className="text-xs text-slate-500">Interactive bars — hover for emphasis.</p>
                <div className="mt-6 space-y-5">
                  {projections.map((p) => (
                    <div key={p.id} className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-medium text-white">{p.name}</span>
                        <span className="text-slate-500">
                          miss {p.plannedMiss} · total {p.totalSessions}
                        </span>
                      </div>
                      <div className="flex gap-3 sm:gap-4">
                        <motion.div
                          className="flex-1"
                          onHoverStart={() => setHovered({ id: p.id, kind: "current" })}
                          onHoverEnd={() => setHovered(null)}
                        >
                          <div className="text-[10px] uppercase text-slate-500">Current</div>
                          <motion.div
                            className="mt-1 h-10 overflow-hidden rounded-xl bg-white/8"
                          >
                            <motion.div
                              className="attendance-chart-bar h-full rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/60"
                              animate={{ width: `${p.currentPct}%` }}
                              transition={{ type: "spring", stiffness: 140, damping: 20 }}
                              style={{
                                boxShadow:
                                  hovered?.id === p.id && hovered.kind === "current"
                                    ? "0 0 24px rgba(0,212,255,0.55)"
                                    : "0 0 12px rgba(0,212,255,0.25)",
                              }}
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div
                          className="flex-1"
                          onHoverStart={() => setHovered({ id: p.id, kind: "projected" })}
                          onHoverEnd={() => setHovered(null)}
                        >
                          <div className="text-[10px] uppercase text-slate-500">Projected</div>
                          <motion.div
                            className="mt-1 h-10 overflow-hidden rounded-xl bg-white/8"
                          >
                            <motion.div
                              className="attendance-chart-bar h-full rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B]/80"
                              animate={{ width: `${p.projectedPct}%` }}
                              transition={{ type: "spring", stiffness: 140, damping: 20 }}
                              style={{
                                boxShadow:
                                  hovered?.id === p.id && hovered.kind === "projected"
                                    ? "0 0 24px rgba(108,99,255,0.55)"
                                    : "0 0 12px rgba(108,99,255,0.25)",
                              }}
                            />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default AttendancePrediction;
