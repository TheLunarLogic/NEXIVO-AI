import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { TimetableEventRecord } from "./subjects";
import { HOUR_START, HOUR_END, HOUR_PX, TIME_COL_W, subjectById } from "./subjects";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const HEADER_H = 36;

type Props = {
  events: TimetableEventRecord[];
  onEventMove: (id: string, weekday: 1 | 2 | 3 | 4 | 5, startHour: number) => void;
  onEventClick: (id: string) => void;
};

export const WeeklyScheduleGrid = ({ events, onEventMove, onEventClick }: Props) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dayWidth, setDayWidth] = useState(120);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setDayWidth(Math.max(48, el.clientWidth / 5));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalHours = HOUR_END - HOUR_START;
  const totalHeight = totalHours * HOUR_PX;
  const hourSlots = Array.from({ length: totalHours }, (_, i) => HOUR_START + i);

  const snapDrag = useCallback(
    (info: PanInfo, eventRecord: TimetableEventRecord) => {
      const el = gridRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dw = r.width / 5;
      const x = info.point.x - r.left;
      const y = info.point.y - r.top;
      let dayIdx = Math.floor(x / dw);
      dayIdx = Math.max(0, Math.min(4, dayIdx));
      const weekday = (dayIdx + 1) as 1 | 2 | 3 | 4 | 5;
      const halfSteps = Math.round(y / (HOUR_PX / 2));
      let newHour = HOUR_START + halfSteps * 0.5;
      const maxStart = HOUR_END - eventRecord.duration;
      newHour = Math.max(HOUR_START, Math.min(maxStart, newHour));
      if (
        weekday !== eventRecord.weekday ||
        Math.abs(newHour - eventRecord.startHour) > 0.01
      ) {
        onEventMove(eventRecord.id, weekday, newHour);
      }
    },
    [onEventMove],
  );

  return (
    <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div
        className="flex shrink-0 flex-col border-r border-white/10 bg-slate-950/80"
        style={{ width: TIME_COL_W }}
      >
        <div style={{ height: HEADER_H }} className="shrink-0 border-b border-white/10" />
        {hourSlots.map((h) => (
          <div
            key={h}
            style={{ height: HOUR_PX }}
            className="flex shrink-0 items-start justify-end border-b border-white/5 pr-1.5 pt-0.5 text-[10px] leading-none text-slate-500"
          >
            {h >= 12 ? (h > 12 ? h - 12 : 12) : h}
            {h >= 12 ? "p" : "a"}m
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 border-b border-white/10 bg-slate-950/70">
          {WEEKDAYS.map((d) => (
            <div key={d} className="flex-1 py-2 text-center text-xs font-medium text-slate-300">
              {d}
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{ height: totalHeight }}
        >
          <div className="absolute inset-0 flex">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className="h-full flex-1 border-l border-white/10 first:border-l-0"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent",
                }}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 flex flex-col">
            {hourSlots.map((h) => (
              <div key={h} className="shrink-0 border-b border-dashed border-white/8" style={{ height: HOUR_PX }} />
            ))}
          </div>

          {events.map((ev) => {
            const sub = subjectById(ev.subjectId);
            const left = (ev.weekday - 1) * dayWidth + 4;
            const top = (ev.startHour - HOUR_START) * HOUR_PX + 3;
            const w = Math.max(40, dayWidth - 8);
            const h = Math.max(26, ev.duration * HOUR_PX - 6);

            return (
      <motion.div
                key={`${ev.id}-${ev.weekday}-${ev.startHour}`}
                layout
                drag
                dragMomentum={false}
                dragElastic={0.06}
                dragConstraints={gridRef}
                whileDrag={{
                  scale: 1.04,
                  zIndex: 40,
                  boxShadow: `0 20px 48px ${sub.glow}`,
                  cursor: "grabbing",
                }}
                whileHover={{ scale: 1.015, zIndex: 15 }}
                onDragEnd={(_e, info) => snapDrag(info, ev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onEventClick(ev.id);
                }}
                onTap={() => onEventClick(ev.id)}
                className="absolute cursor-grab overflow-hidden rounded-xl border px-2 py-1 text-left text-xs shadow-lg outline-none ring-offset-2 ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
                style={{
                  left,
                  top,
                  width: w,
                  height: h,
                  borderColor: `${sub.color}77`,
                  background: `linear-gradient(165deg, ${sub.color}40, rgba(15,23,42,0.9))`,
                  boxShadow: `0 8px 28px ${sub.glow}`,
                }}
                transition={{ type: "spring", stiffness: 440, damping: 34 }}
              >
                <p className="truncate font-semibold text-white">{ev.title}</p>
                <p className="truncate text-[10px] text-slate-300">{sub.name}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
