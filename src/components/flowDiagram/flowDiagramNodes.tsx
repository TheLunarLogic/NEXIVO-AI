/* ───────────────────────────────────────────────────────────
 *  Custom React Flow node components
 *
 *  Each node type gets its own visual shape (pill, rectangle,
 *  parallelogram, diamond, hexagon-ish) rendered in the
 *  project's dark neon-glass design language.
 * ─────────────────────────────────────────────────────────── */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

/* ── shared helpers ──────────────────────────────────────── */

interface FlowNodeData {
  label: string;
  onLabelChange?: (id: string, label: string) => void;
  [key: string]: unknown;
}

type CustomNodeProps = NodeProps & { data: FlowNodeData };

/**
 * Inline-editable label. Double-click to edit, blur / Enter to save.
 */
function EditableLabel({
  id,
  label,
  onLabelChange,
  className = "",
}: {
  id: string;
  label: string;
  onLabelChange?: (id: string, label: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft.trim() && draft !== label) {
      onLabelChange?.(id, draft.trim());
    } else {
      setDraft(label);
    }
  }, [draft, label, id, onLabelChange]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(label);
            setEditing(false);
          }
        }}
        className={`flow-node-input w-full bg-transparent text-center text-xs font-medium text-white outline-none ${className}`}
        style={{ minWidth: 40 }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      className={`block cursor-text select-none truncate text-center text-xs font-medium text-white ${className}`}
      title="Double-click to edit"
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  NODE COMPONENTS                                            */
/* ─────────────────────────────────────────────────────────── */

/** Start / End — rounded pill */
export const StartEndNode = memo(({ id, data }: CustomNodeProps) => {
  const isStart = (data.label ?? "").toLowerCase().includes("start");
  return (
    <div
      className="flow-node-start-end"
      style={{
        background: isStart
          ? "linear-gradient(135deg, rgba(0,212,255,0.35), rgba(108,99,255,0.25))"
          : "linear-gradient(135deg, rgba(255,107,107,0.35), rgba(255,140,66,0.25))",
        border: `1px solid ${isStart ? "rgba(0,212,255,0.5)" : "rgba(255,107,107,0.5)"}`,
        borderRadius: 999,
        padding: "10px 28px",
        minWidth: 100,
        textAlign: "center" as const,
        backdropFilter: "blur(12px)",
        boxShadow: isStart
          ? "0 0 24px rgba(0,212,255,0.25)"
          : "0 0 24px rgba(255,107,107,0.25)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/40 !w-2 !h-2 !border-0" />
      <EditableLabel id={id} label={data.label} onLabelChange={data.onLabelChange} />
      <Handle type="source" position={Position.Bottom} className="!bg-white/40 !w-2 !h-2 !border-0" />
    </div>
  );
});
StartEndNode.displayName = "StartEndNode";

/** Process — glass rectangle */
export const ProcessNode = memo(({ id, data }: CustomNodeProps) => (
  <div
    className="flow-node-process"
    style={{
      background: "linear-gradient(155deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
      border: "1px solid rgba(108,99,255,0.4)",
      borderRadius: 12,
      padding: "12px 24px",
      minWidth: 120,
      textAlign: "center" as const,
      backdropFilter: "blur(14px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.35), 0 0 18px rgba(108,99,255,0.15)",
    }}
  >
    <Handle type="target" position={Position.Top} className="!bg-[#6C63FF] !w-2 !h-2 !border-0" />
    <EditableLabel id={id} label={data.label} onLabelChange={data.onLabelChange} />
    <Handle type="source" position={Position.Bottom} className="!bg-[#6C63FF] !w-2 !h-2 !border-0" />
  </div>
));
ProcessNode.displayName = "ProcessNode";

/** Input / Output — parallelogram */
export const InputOutputNode = memo(({ id, data }: CustomNodeProps) => (
  <div
    className="flow-node-io"
    style={{
      background: "linear-gradient(155deg, rgba(0,212,255,0.15), rgba(108,99,255,0.08))",
      border: "1px solid rgba(0,212,255,0.45)",
      borderRadius: 8,
      padding: "12px 30px",
      minWidth: 130,
      textAlign: "center" as const,
      transform: "skewX(-12deg)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.3), 0 0 16px rgba(0,212,255,0.12)",
    }}
  >
    <Handle type="target" position={Position.Top} className="!bg-[#00D4FF] !w-2 !h-2 !border-0" />
    <div style={{ transform: "skewX(12deg)" }}>
      <EditableLabel id={id} label={data.label} onLabelChange={data.onLabelChange} />
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-[#00D4FF] !w-2 !h-2 !border-0" />
  </div>
));
InputOutputNode.displayName = "InputOutputNode";

/** Decision — diamond */
export const DecisionNode = memo(({ id, data }: CustomNodeProps) => (
  <div
    className="flow-node-decision relative flex items-center justify-center"
    style={{ width: 110, height: 110 }}
  >
    {/* Diamond background */}
    <div
      style={{
        position: "absolute",
        width: 78,
        height: 78,
        background: "linear-gradient(135deg, rgba(255,200,50,0.2), rgba(255,160,30,0.1))",
        border: "1px solid rgba(255,200,50,0.5)",
        transform: "rotate(45deg)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.35), 0 0 20px rgba(255,200,50,0.15)",
        borderRadius: 8,
      }}
    />

    {/* Content */}
    <div className="relative z-10" style={{ padding: "0 4px", maxWidth: 90 }}>
      <EditableLabel id={id} label={data.label} onLabelChange={data.onLabelChange} className="!text-[10px]" />
    </div>

    {/* Input Handle */}
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-yellow-300/60 !w-2 !h-2 !border-0"
    />

    {/* Bottom Output Handle (True) */}
    <Handle
      type="source"
      position={Position.Bottom}
      id="true"
      className="!bg-yellow-300/60 !w-2 !h-2 !border-0"
    />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5 text-[9px] font-bold text-yellow-400 uppercase tracking-widest pointer-events-none">
      True
    </div>

    {/* Right Output Handle (False) */}
    <Handle
      type="source"
      position={Position.Right}
      id="false"
      className="!bg-yellow-300/60 !w-2 !h-2 !border-0"
    />
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-7 text-[9px] font-bold text-yellow-400 uppercase tracking-widest pointer-events-none">
      False
    </div>
  </div>
));
DecisionNode.displayName = "DecisionNode";

/** Loop — rounded rectangle with accent */
export const LoopNode = memo(({ id, data }: CustomNodeProps) => (
  <div
    className="flow-node-loop relative"
    style={{
      background: "linear-gradient(155deg, rgba(168,85,247,0.2), rgba(108,99,255,0.12))",
      border: "1px solid rgba(168,85,247,0.5)",
      borderRadius: 16,
      padding: "10px 24px",
      minWidth: 120,
      textAlign: "center" as const,
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.35), 0 0 20px rgba(168,85,247,0.18)",
    }}
  >
    <Handle type="target" position={Position.Top} className="!bg-purple-400/60 !w-2 !h-2 !border-0" />
    <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-purple-300/70">
      Loop
    </div>
    <EditableLabel id={id} label={data.label} onLabelChange={data.onLabelChange} />
    
    {/* Body Output Handle */}
    <Handle type="source" position={Position.Bottom} id="body" className="!bg-purple-400/60 !w-2 !h-2 !border-0" />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-[9px] font-bold text-purple-400 uppercase tracking-widest pointer-events-none">
      Body
    </div>

    {/* Exit Output Handle */}
    <Handle type="source" position={Position.Right} id="exit" className="!bg-purple-400/60 !w-2 !h-2 !border-0" />
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-7 text-[9px] font-bold text-purple-400 uppercase tracking-widest pointer-events-none">
      Exit
    </div>
  </div>
));
LoopNode.displayName = "LoopNode";

/* ── Export the nodeTypes map required by React Flow ──────── */

export const nodeTypes = {
  start: StartEndNode,
  end: StartEndNode,
  process: ProcessNode,
  input_output: InputOutputNode,
  decision: DecisionNode,
  loop: LoopNode,
};
