
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export interface TimetableEntry {
  subjectId: string;
  dayOfWeek: Weekday;
}

export interface ForecastInput {
  currentAttended: number;
  currentAbsent: number;
  absentWeekdays: Set<Weekday>;
  specificHolidays: string[]; // ISO dates "YYYY-MM-DD"
  termEndDate: string; // ISO date
  timetable: TimetableEntry[];
  subjectId: string;
}

export interface ForecastResult {
  projectedAttended: number;
  projectedAbsent: number;
  projectedPct: number;
  totalFutureSessions: number;
  missedFutureSessions: number;
}

export function calculateForecast(input: ForecastInput): ForecastResult {
  const {
    currentAttended,
    currentAbsent,
    absentWeekdays,
    specificHolidays,
    termEndDate,
    timetable,
    subjectId,
  } = input;

  const end = new Date(termEndDate);
  let current = new Date();
  // Start from tomorrow
  current.setDate(current.getDate() + 1);

  let futureSessions = 0;
  let futureMisses = 0;

  const subjectDays = new Set(
    timetable.filter((t) => t.subjectId === subjectId).map((t) => t.dayOfWeek)
  );

  const holidays = new Set(specificHolidays);

  while (current <= end) {
    const dayOfWeek = current.getDay() as Weekday;
    const dateStr = current.toISOString().split("T")[0];

    if (subjectDays.has(dayOfWeek)) {
      futureSessions++;
      if (absentWeekdays.has(dayOfWeek) || holidays.has(dateStr)) {
        futureMisses++;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  const totalAttended = currentAttended + (futureSessions - futureMisses);
  const totalAbsent = currentAbsent + futureMisses;
  const totalSessions = totalAttended + totalAbsent;

  const projectedPct = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 0;

  return {
    projectedAttended: totalAttended,
    projectedAbsent: totalAbsent,
    projectedPct: Math.min(100, Math.max(0, projectedPct)),
    totalFutureSessions: futureSessions,
    missedFutureSessions: futureMisses,
  };
}
