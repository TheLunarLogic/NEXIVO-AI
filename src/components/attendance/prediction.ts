export type SubjectAttendanceRow = {
  id: string;
  name: string;
  attended: number;
  absent: number;
  remaining: number;
  extraPlannedMiss: number;
};

export type SubjectProjection = {
  id: string;
  name: string;
  currentPct: number;
  projectedPct: number;
  totalSessions: number;
  doneSessions: number;
  plannedMiss: number;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function projectSubject(
  row: SubjectAttendanceRow,
  sharedMissFromLeaves: number,
): SubjectProjection {
  const total = row.attended + row.absent + row.remaining;
  const done = row.attended + row.absent;
  const rawCurrent = done > 0 ? (row.attended / done) * 100 : 0;
  const currentPct = clamp(rawCurrent, 0, 100);

  if (total <= 0) {
    return {
      id: row.id,
      name: row.name,
      currentPct,
      projectedPct: currentPct,
      totalSessions: 0,
      doneSessions: done,
      plannedMiss: 0,
    };
  }

  const plannedMiss = clamp(
    row.extraPlannedMiss + sharedMissFromLeaves,
    0,
    row.remaining,
  );
  const projectedPct = clamp(
    ((row.attended + row.remaining - plannedMiss) / total) * 100,
    0,
    100,
  );

  return {
    id: row.id,
    name: row.name,
    currentPct,
    projectedPct,
    totalSessions: total,
    doneSessions: done,
    plannedMiss,
  };
}

/** Extra missed sessions per subject from shared leave calendar. */
export function distributeLeaveMisses(
  leaveDayCount: number,
  sessionsPerLeaveDay: number,
  subjectCount: number,
): number {
  if (subjectCount <= 0 || leaveDayCount <= 0) return 0;
  const totalMiss = leaveDayCount * sessionsPerLeaveDay;
  return Math.ceil(totalMiss / subjectCount);
}

export function weightedAverage(
  items: { value: number; weight: number }[],
): number {
  const w = items.reduce((a, x) => a + x.weight, 0);
  if (w <= 0) return 0;
  return items.reduce((a, x) => a + x.value * x.weight, 0) / w;
}
