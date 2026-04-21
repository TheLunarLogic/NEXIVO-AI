import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DocumentChat from "./pages/DocumentChat";
import StudyQuiz from "./pages/StudyQuiz";
import ResumeBuilderV2 from "./pages/ResumeBuilderV2";
import JobFinder from "./pages/JobFinder";
import JobDetails from "./pages/JobDetails";
import Roadmap from "./pages/Roadmap";
import FlowToCode from "./pages/FlowToCode";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doc-chat" element={<DocumentChat />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/study" element={<StudyQuiz />} />
        <Route path="/resume" element={<ResumeBuilderV2 />} />
        <Route path="/jobs" element={<JobFinder />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route path="/flow-to-code" element={<FlowToCode />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(15,23,42,0.95)",
            color: "#fff",
            border: "1px solid rgba(108,99,255,0.35)",
          },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
