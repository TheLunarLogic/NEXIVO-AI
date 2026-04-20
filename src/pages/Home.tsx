import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { isLoggedIn } from "../utils/auth";

const features = [
  {
    title: "Resume Builder",
    description:
      "Edit resumes with templates, cover letter, and ATS score support.",
    icon: "👔",
    href: "/resume",
  },
  {
    title: "Job Finder",
    description:
      "Find jobs by filters, ranked with AI-powered match scores.",
    icon: "💼",
    href: "/jobs",
  },
  {
    title: "Quiz & Flashcards",
    description:
      "Test yourself with quizzes or flashcards to master key concepts.",
    icon: "🔍",
    href: "/study",
  },
  {
    title: "Roadmap + Resources",
    description:
      "Get a step-by-step roadmap for any skill with curated resources and videos.",
    icon: "🗺️",
    href: "/roadmap",
  },
  {
    title: "Document Chat",
    description:
      "Chat-based assistant with uploads, voice input, floating window, AI.",
    icon: "💬",
    href: "/doc-chat",
  },
  {
    title: "Attendance Prediction",
    description:
      "Plan sessions, leave days. Instantly see projections and animated charts.",
    icon: "📊",
    href: "/attendance",
  },
  {
    title: "Smart Timetable",
    description:
      "Color-coded calendar with drag, sync, weekly and monthly views.",
    icon: "🕒",
    href: "/timetable",
  },
  {
    title: "Assignment Solver",
    description:
      "Upload, scan worksheet; extract questions, view step-by-step answers instantly.",
    icon: "📝",
    href: "/assignment",
  },
  {
    title: "Lab Experiments Solver",
    description:
      "Get instant code solutions and explanations for lab experiments online.",
    icon: "💻",
    href: "/lab",
  },
  {
    title: "Document Summarizer",
    description:
      "Upload notes or PDFs, preview and generate AI summaries quickly.",
    icon: "📄",
    href: "/summarize",
  },
  {
    title: "Topic Explainer",
    description:
      "Enter topic for structured overview with expandable examples and notes.",
    icon: "🧠",
    href: "/concepts",
  },
  {
    title: "Flow To Code",
    description:
      "Build a flowchart with drag-and-drop, then convert it into working code.",
    icon: "🔄",
    href: "/flow-to-code",
  }
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Upload",
    description: "Add notes, slides, syllabi, or record a lecture—Nexivo ingests it securely.",
    emoji: "📤",
  },
  {
    step: "02",
    title: "AI Process",
    description: "Our models summarize, structure, and link concepts into actionable tasks.",
    emoji: "⚡",
  },
  {
    step: "03",
    title: "Result",
    description: "Get plans, flashcards, quizzes, and a dashboard that updates as you learn.",
    emoji: "🎓",
  },
];

const testimonials = [
  {
    quote:
      "I cut my review time in half. The planner actually respects how tired I am during finals.",
    name: "Priya Malhotra",
    role: "CS undergrad",
    initial: "P",
  },
  {
    quote:
      "Lecture summaries are scary accurate. It's like having a TA that never sleeps.",
    name: "Jordan Lee",
    role: "Pre-med sophomore",
    initial: "J",
  },
  {
    quote: "Streaks and focus mode finally got me off my phone. My GPA thanked me.",
    name: "Sam Okonkwo",
    role: "Engineering junior",
    initial: "S",
  },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Demo", href: "#demo" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

const Home = () => {
  const [contact, setContact] = useState({
    name: "",
    email: "",
    message: "",
  });

  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== "#features") return;
    const el = document.getElementById("features");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    const name = contact.name.trim();
    const email = contact.email.trim();
    const message = contact.message.trim();

    if (!name) {
      toast.error("Please enter your name.");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }
    if (!message) {
      toast.error("Please write a message.");
      return;
    }

    // No backend wired yet: emulate a successful submission.
    toast.success("Message sent! We'll get back to you soon.");
    setContact({ name: "", email: "", message: "" });
  };

  return (
    <motion.main
      className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(160deg,#0F172A_0%,#020617_100%)] text-white"
      {...pageTransition}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,99,255,0.22),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(0,212,255,0.14),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,107,107,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-10">
        <header className="sticky top-4 z-30 mt-4">
          <div className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
            <a href="#" className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_14px_#00D4FF]" />
              <span className="text-lg font-semibold tracking-wide">Nexivo AI</span>
            </a>
            <nav className="relative hidden gap-6 text-sm text-slate-200 md:flex">
              <a className="nav-link" href="#features">
                Features
              </a>
              <a className="nav-link" href="#how-it-works">
                How it works
              </a>
              <a className="nav-link" href="#demo">
                Demo
              </a>
              <a className="nav-link" href="#testimonials">
                Stories
              </a>
              <a className="nav-link" href="#contact-us">
                Contact Us
              </a>
              {isLoggedIn() ? (
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              ) : null}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn-glow-secondary hidden rounded-2xl px-4 py-2 text-sm font-semibold sm:inline-flex"
              >
                Try Demo
              </Link>
              <Link
                to="/signup"
                className="btn-glow-primary rounded-2xl px-4 py-2 text-sm font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <motion.section
          className="relative grid items-center gap-12 pt-14 md:grid-cols-[1.05fr_0.95fr] md:pt-20"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#00D4FF]">
              AI-powered student productivity
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl">
              Your{" "}
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#8B84FF] to-[#00D4FF] bg-clip-text text-transparent">
                AI Study Companion
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Turn scattered notes and deadlines into one calm, intelligent workspace. Plan
              deeper focus, remember more, and ship every assignment—without burning out.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="btn-glow-primary rounded-2xl px-8 py-3.5 text-base font-semibold"
              >
                Get Started
              </Link>
              <a href="#demo" className="btn-glow-secondary rounded-2xl px-8 py-3.5 text-base font-semibold">
                Try Demo
              </a>
            </div>
            <p className="text-xs text-slate-500">
              No credit card for the trial · Built for students · Privacy-first AI ·{" "}
              <Link to="/login" className="text-[#00D4FF] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <motion.div
              className="glass-card hero-preview-card relative overflow-hidden rounded-2xl p-6 sm:p-8"
              whileHover={{ scale: 1.02, y: -6 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#6C63FF]/30 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#00D4FF]/20 blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">Today&apos;s focus</span>
                  <span className="rounded-full bg-[#00D4FF]/20 px-2.5 py-0.5 text-xs text-[#7AE9FF]">
                    Live
                  </span>
                </div>
                <motion.div
                  className="h-2 overflow-hidden rounded-full bg-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]"
                    initial={{ width: "12%" }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                  />
                </motion.div>
                <div className="space-y-2">
                  {["O-Chem chapter 7", "Linear algebra problem set", "Essay outline draft"].map(
                    (task, i) => (
                      <motion.div
                        key={task}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.12 }}
                      >
                        <span className="text-lg">{i === 0 ? "✓" : "○"}</span>
                        <span className="text-sm text-slate-200">{task}</span>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          className="mt-24 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={staggerContainer}
        >
          <motion.div className="mx-auto mb-12 max-w-2xl text-center" variants={staggerItem}>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] bg-clip-text text-transparent">
                stay ahead
              </span>
            </h2>
            <p className="mt-3 text-slate-300">
              Ten powerful tools in one glass-smooth interface—each tuned for how students
              actually work.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.href}
                className="block"
                aria-label={`Open ${feature.title}`}
              >
                <motion.article
                  className="feature-card glass-card cursor-pointer rounded-2xl p-5"
                  variants={staggerItem}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <div className="feature-icon-ring mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </motion.article>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="how-it-works"
          className="mt-24 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={sectionVariants}
        >
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-slate-300">
              Three steps from chaos to clarity—with animated AI pipelines you can trust.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-0 md:flex-row md:items-center md:justify-center">
            {howItWorksSteps.map((item, index) => (
              <Fragment key={item.step}>
                {index > 0 && (
                  <>
                    <div
                      className="connector-vertical mx-auto my-2 h-10 w-px shrink-0 md:hidden"
                      aria-hidden
                    />
                    <div
                      className="connector-horizontal relative hidden h-0.5 w-10 shrink-0 md:block md:w-14 lg:w-20"
                      aria-hidden
                    >
                      <motion.div
                        className="connector-flow absolute inset-0 rounded-full"
                        animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </>
                )}
                <motion.div
                  className="glass-card relative z-[1] w-full max-w-sm flex-1 rounded-2xl p-6 md:min-w-0"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(108,99,255,0.35)" }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="font-mono text-xs text-[#00D4FF]">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="demo"
          className="mt-24 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
        >
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Demo preview</h2>
            <p className="mt-3 text-slate-300">
              Your command center for courses, focus, and AI insights—animated and alive.
            </p>
          </div>
          <motion.div
            className="glass-card overflow-hidden rounded-2xl border border-[#6C63FF]/25 shadow-[0_0_60px_rgba(108,99,255,0.15)]"
            whileHover={{ boxShadow: "0 0 80px rgba(0,212,255,0.12)" }}
          >
            <div className="demo-mockup flex min-h-[320px] flex-col md:min-h-[380px] md:flex-row">
              <aside className="demo-sidebar flex flex-col gap-2 border-b border-white/10 p-4 md:w-52 md:border-b-0 md:border-r">
                {["Overview", "Courses", "Planner", "AI Coach"].map((item, i) => (
                  <motion.span
                    key={item}
                    className={`rounded-xl px-3 py-2 text-sm ${
                      i === 0
                        ? "bg-[#6C63FF]/25 text-white"
                        : "text-slate-400 hover:bg-white/5"
                    }`}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 * i }}
                  >
                    {item}
                  </motion.span>
                ))}
              </aside>
              <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#00D4FF]">Dashboard</p>
                    <p className="text-lg font-semibold">Spring semester</p>
                  </div>
                  <motion.span
                    className="rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-3 py-1 text-xs text-[#9EF6FF]"
                    animate={{ opacity: [0.75, 1, 0.75] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    AI insights updating
                  </motion.span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Focus score", value: "92%", color: "from-[#00D4FF] to-[#6C63FF]" },
                    { label: "Due this week", value: "8", color: "from-[#6C63FF] to-[#FF6B6B]" },
                    { label: "Streak", value: "14d", color: "from-[#FF6B6B] to-[#6C63FF]" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p
                        className={`mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-2xl font-bold text-transparent`}
                      >
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-xs text-slate-400">Weekly activity</p>
                  <div className="flex h-28 items-end justify-between gap-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((pct, i) => (
                      <motion.div
                        key={i}
                        className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-[#6C63FF]/50 to-[#00D4FF]/90"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          height: `${(pct / 100) * 112}px`,
                          transformOrigin: "bottom",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          id="testimonials"
          className="mt-24 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={staggerContainer}
        >
          <motion.div className="mx-auto mb-12 max-w-2xl text-center" variants={staggerItem}>
            <h2 className="text-3xl font-bold sm:text-4xl">Loved by focused students</h2>
            <p className="mt-3 text-slate-300">
              Real feedback from people juggling lectures, labs, and life.
            </p>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.blockquote
                key={t.name}
                className="glass-card rounded-2xl p-6"
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <p className="text-sm leading-relaxed text-slate-200">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] text-sm font-bold text-white">
                    {t.initial}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mt-24 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={sectionVariants}
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#6C63FF]/30 via-[#020617] to-[#00D4FF]/20 p-10 text-center shadow-[0_0_80px_rgba(108,99,255,0.25)] sm:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(108,99,255,0.25),transparent_55%)]" />
            <div className="relative space-y-6">
              <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                Boost your productivity with AI
              </h2>
              <p className="mx-auto max-w-xl text-slate-200">
                Join thousands of students who replaced scattered tabs with one glowing workspace.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/signup"
                  className="btn-glow-primary rounded-2xl px-10 py-3.5 text-base font-semibold"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="btn-glow-secondary rounded-2xl px-10 py-3.5 text-base font-semibold"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="contact-us"
          className="scroll-mt-24 mt-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
        >
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10 backdrop-blur-xl">
            <div className="mb-6">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#00D4FF]">
                Contact us
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">We'd love to hear from you</h2>
              <p className="mt-3 text-slate-300">
                Send a message and our team will reply. (This demo form is front-end only right now.)
              </p>
            </div>

            <form onSubmit={submitContact} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Your name
                </label>
                <input
                  value={contact.name}
                  onChange={(ev) => setContact((p) => ({ ...p, name: ev.target.value }))}
                  placeholder="e.g. Arjun Sharma"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Email
                </label>
                <input
                  value={contact.email}
                  onChange={(ev) => setContact((p) => ({ ...p, email: ev.target.value }))}
                  placeholder="you@email.com"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                  Message
                </label>
                <textarea
                  value={contact.message}
                  onChange={(ev) => setContact((p) => ({ ...p, message: ev.target.value }))}
                  placeholder="How can we help?"
                  rows={5}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#6C63FF]/45"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end">
                <button type="submit" className="btn-glow-primary rounded-2xl px-6 py-3 text-sm font-semibold">
                  Send message
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        <footer className="mt-20 border-t border-white/10 pt-12 pb-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_14px_#00D4FF]" />
                <span className="text-lg font-semibold">Nexivo AI</span>
              </div>
              <p className="text-sm text-slate-400">
                The AI study companion for calmer, sharper academic life.
              </p>
              <div className="flex gap-3">
                <a
                  className="social-icon"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  className="social-icon"
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.8449c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  className="social-icon"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  className="social-icon"
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Discord"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-sm font-semibold text-white">{col.title}</p>
                <ul className="space-y-2 text-sm text-slate-400">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a className="footer-link transition hover:text-[#00D4FF]" href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Nexivo AI. All rights reserved.
          </p>
        </footer>
      </div>
    </motion.main>
  );
};

export default Home;
