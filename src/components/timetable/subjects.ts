export type Subject = {
  id: string;
  name: string;
  color: string;
  glow: string;
};

export const SUBJECTS: Subject[] = [
  { id: "math", name: "Mathematics", color: "#6C63FF", glow: "rgba(108,99,255,0.45)" },
  { id: "chem", name: "Chemistry", color: "#00D4FF", glow: "rgba(0,212,255,0.45)" },
  { id: "cs", name: "Computer Science", color: "#FF6B6B", glow: "rgba(255,107,107,0.45)" },
  { id: "phys", name: "Physics", color: "#A78BFA", glow: "rgba(167,139,250,0.45)" },
  { id: "lit", name: "Literature", color: "#34D399", glow: "rgba(52,211,153,0.45)" },
  { id: "other", name: "Other", color: "#94A3B8", glow: "rgba(148,163,184,0.45)" },
];

export type TimetableEventRecord = {
  id: string;
  subjectId: string;
  title: string;
  /** 1 = Monday … 5 = Friday (matches `Date.getDay()` Mon–Fri) */
  weekday: 1 | 2 | 3 | 4 | 5;
  startHour: number;
  duration: number;
};

export const HOUR_START = 8;
export const HOUR_END = 19;
export const SNAP_MINUTES = 30;
export const HOUR_PX = 56;
export const TIME_COL_W = 52;

export function subjectById(id: string): Subject {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[SUBJECTS.length - 1];
}

export function hourToLabel(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const ap = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return min ? `${h12}:${min.toString().padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
}
