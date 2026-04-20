/* ───────────────────────────────────────────────────────────
 *  Draggable node palette (sidebar on the left of the canvas)
 * ─────────────────────────────────────────────────────────── */

import type { FlowNodeKind } from "./flowDiagramTypes";

interface PaletteItem {
  type: FlowNodeKind;
  label: string;
  icon: string;
  color: string;
}

const PALETTE: PaletteItem[] = [
  { type: "start", label: "Start", icon: "▶", color: "rgba(0,212,255,0.45)" },
  { type: "end", label: "End", icon: "⏹", color: "rgba(255,107,107,0.45)" },
  { type: "process", label: "Process", icon: "⚙", color: "rgba(108,99,255,0.45)" },
  { type: "input_output", label: "I / O", icon: "↔", color: "rgba(0,212,255,0.45)" },
  { type: "decision", label: "Decision", icon: "◆", color: "rgba(255,200,50,0.45)" },
  { type: "loop", label: "Loop", icon: "🔁", color: "rgba(168,85,247,0.45)" },
];

export const NodeSidebar = () => {
  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    nodeType: FlowNodeKind,
  ) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flow-node-sidebar flex flex-col gap-2">
      <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Components
      </h3>
      {PALETTE.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(e) => onDragStart(e, item.type)}
          className="flow-sidebar-item group flex cursor-grab items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-300 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white active:cursor-grabbing"
          title={`Drag "${item.label}" onto the canvas`}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition group-hover:scale-110"
            style={{ background: item.color }}
          >
            {item.icon}
          </span>
          <span className="font-medium">{item.label}</span>
        </div>
      ))}
      <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
        Drag components onto the canvas. Double-click node labels to edit.
      </p>
    </div>
  );
};
