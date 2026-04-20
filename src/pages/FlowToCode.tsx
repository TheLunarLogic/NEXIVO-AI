/* ───────────────────────────────────────────────────────────
 *  Flow Diagram → Code Generator — page
 *
 *  Split-screen layout:
 *    Left  = NodeSidebar + FlowCanvas (drag-and-drop builder)
 *    Right = OutputPanel  (Code / Explanation / Dry Run)
 * ─────────────────────────────────────────────────────────── */

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ReactFlowProvider } from "@xyflow/react";

import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { NodeSidebar } from "../components/flowDiagram/NodeSidebar";
import { FlowCanvas } from "../components/flowDiagram/FlowCanvas";
import { OutputPanel } from "../components/flowDiagram/OutputPanel";
import { generateCodeFromFlow } from "../components/flowDiagram/flowToCodeApi";
import type {
  FlowJSON,
  FlowToCodeResponse,
  OutputTab,
  LangId,
} from "../components/flowDiagram/flowDiagramTypes";

const FlowToCode = () => {
  /* ── state ──────────────────────────────────────────────── */
  const [response, setResponse] = useState<FlowToCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>("code");
  const [language, setLanguage] = useState<LangId>("python");

  /* ── convert handler ────────────────────────────────────── */
  const handleConvert = useCallback(async (json: FlowJSON) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await generateCodeFromFlow(json);
      setResponse(res);
      setActiveTab("code");
      toast.success("Code generated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── render ─────────────────────────────────────────────── */
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
          {/* header */}
          <div className="relative z-[2] mb-5 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Flow Diagram → Code
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Build a flowchart with drag-and-drop, then convert it into working
              code in C, C++, Python, or Java — with step-by-step explanation
              and dry run.
            </p>
          </div>

          {/* split screen */}
          <div className="relative z-[2] grid gap-4 lg:grid-cols-2 lg:gap-5" style={{ minHeight: "calc(100vh - 220px)" }}>
            {/* LEFT — sidebar + canvas */}
            <div className="neon-glass-panel flex overflow-hidden rounded-2xl">
              {/* node palette */}
              <div className="w-[140px] shrink-0 border-r border-white/10 p-3">
                <NodeSidebar />
              </div>
              {/* canvas */}
              <div className="flex-1">
                <ReactFlowProvider>
                  <FlowCanvas
                    onConvert={handleConvert}
                    converting={loading}
                  />
                </ReactFlowProvider>
              </div>
            </div>

            {/* RIGHT — output panel */}
            <div className="neon-glass-panel overflow-hidden rounded-2xl">
              <OutputPanel
                response={response}
                loading={loading}
                error={error}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                language={language}
                setLanguage={setLanguage}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default FlowToCode;
