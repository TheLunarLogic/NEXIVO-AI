/* ───────────────────────────────────────────────────────────
 *  Flow Diagram → Code Generator — shared types
 * ─────────────────────────────────────────────────────────── */

/** Shape / semantic role of a flow-diagram node. */
export type FlowNodeKind =
  | "start"
  | "end"
  | "process"
  | "input_output"
  | "decision"
  | "loop";

/** Serialised representation of a single node in the flow JSON. */
export interface FlowNodeJSON {
  id: string;
  type: FlowNodeKind;
  label: string;
  /** Used by decision / loop nodes for their condition text. */
  condition?: string;
  /** Used by process / input_output nodes for their code/value. */
  value?: string;
}

/** Serialised representation of an edge. */
export interface FlowEdgeJSON {
  from: string;
  to: string;
  label?: string;
}

/** The JSON payload sent to the code-generation endpoint. */
export interface FlowJSON {
  nodes: FlowNodeJSON[];
  edges: FlowEdgeJSON[];
}

/* ── Response from the code-generation API ────────────────── */

export type LangId = "c" | "cpp" | "python" | "java";

export const LANGUAGES: { id: LangId; label: string; prism: string }[] = [
  { id: "c", label: "C", prism: "c" },
  { id: "cpp", label: "C++", prism: "cpp" },
  { id: "python", label: "Python", prism: "python" },
  { id: "java", label: "Java", prism: "java" },
];

export interface DryRunResult {
  input: string;
  steps: string[];
  output: string;
}

export interface FlowToCodeResponse {
  code: Record<LangId, string>;
  explanation: string[];
  dryRun: DryRunResult;
}

export type OutputTab = "code" | "explanation" | "dryrun";
