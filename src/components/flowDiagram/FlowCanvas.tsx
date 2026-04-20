/* ───────────────────────────────────────────────────────────
 *  Flow Canvas — React Flow wrapper
 *
 *  Handles drop-to-create, node/edge state, label editing,
 *  and exposes a serialise-to-JSON callback for the parent.
 * ─────────────────────────────────────────────────────────── */

import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
  type ReactFlowInstance,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./flowDiagramNodes";
import type { FlowNodeKind, FlowJSON } from "./flowDiagramTypes";

/* ── default labels per type ─────────────────────────────── */

const DEFAULT_LABELS: Record<FlowNodeKind, string> = {
  start: "Start",
  end: "End",
  process: "Process",
  input_output: "Input / Output",
  decision: "if (condition)",
  loop: "i < 5",
};

/* ── component ───────────────────────────────────────────── */

interface FlowCanvasProps {
  onConvert: (json: FlowJSON) => void;
  converting: boolean;
}

let nodeId = 0;
const nextId = () => `node_${++nodeId}`;

export const FlowCanvas = ({ onConvert, converting }: FlowCanvasProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  /* ── label editing callback shared with every node ────── */
  const onLabelChange = useCallback(
    (id: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n,
        ),
      );
    },
    [setNodes],
  );

  /* ── connecting two nodes ─────────────────────────────── */
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "rgba(108,99,255,0.6)", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6C63FF" },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  /* ── drop handler — create node from palette ──────────── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as FlowNodeKind;
      if (!type) return;

      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds || !rfInstance.current) return;

      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const newNode: Node = {
        id: nextId(),
        type,
        position,
        data: {
          label: DEFAULT_LABELS[type] ?? type,
          onLabelChange,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [onLabelChange, setNodes],
  );

  /* ── serialise to FlowJSON ────────────────────────────── */
  const handleConvert = useCallback(() => {
    const json: FlowJSON = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.type ?? "process") as FlowNodeKind,
        label: (n.data as { label: string }).label ?? "",
        ...(n.type === "decision" || n.type === "loop"
          ? { condition: (n.data as { label: string }).label }
          : {}),
        ...(n.type === "process" || n.type === "input_output"
          ? { value: (n.data as { label: string }).label }
          : {}),
      })),
      edges: edges.map((e) => ({
        from: e.source,
        to: e.target,
        ...(e.label ? { label: String(e.label) } : {}),
      })),
    };
    onConvert(json);
  }, [nodes, edges, onConvert]);

  /* ── inject onLabelChange into existing node data ─────── */
  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, onLabelChange },
      })),
    [nodes, onLabelChange],
  );

  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00D4FF]">
          Flow Diagram
        </h2>
        <button
          type="button"
          disabled={converting || nodes.length === 0}
          onClick={handleConvert}
          className="btn-glow-primary rounded-xl px-5 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
        >
          {converting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Converting…
            </span>
          ) : (
            "Convert →"
          )}
        </button>
      </div>

      {/* canvas */}
      <div ref={wrapperRef} className="flex-1" style={{ minHeight: 0 }}>
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={(instance) => {
            rfInstance.current = instance as unknown as ReactFlowInstance;
          }}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="flow-canvas-bg"
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "rgba(108,99,255,0.5)", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6C63FF" },
          }}
        >
          <Controls
            className="!bg-slate-900/80 !border-white/10 !rounded-xl !shadow-lg"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-slate-900/70 !border-white/10 !rounded-xl"
            nodeColor={() => "rgba(108,99,255,0.6)"}
            maskColor="rgba(0,0,0,0.5)"
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(108,99,255,0.15)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
