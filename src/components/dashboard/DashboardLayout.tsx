import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";

const navItems = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    id: "planner",
    label: "Planner",
    href: "/timetable",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    id: "courses",
    label: "Courses",
    href: "/dashboard#courses",
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
  },
  {
    id: "attendance",
    label: "Attendance",
    href: "/attendance",
    icon: (
      <>
        <path d="M12 20v-6" />
        <path d="M6 20v-4" />
        <path d="M18 20v-8" />
        <path d="M6 16H4V2h16v14h-2" />
        <path d="M10 6h4v4h-4z" />
      </>
    ),
  },
  {
    id: "assignment",
    label: "Solver",
    href: "/assignment",
    icon: (
      <>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </>
    ),
  },
  {
    id: "lab",
    label: "Lab",
    href: "/lab",
    icon: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </>
    ),
  },
  {
    id: "flowchart",
    label: "Flowchart",
    href: "/flow-to-code",
    icon: (
      <>
        <path d="M5 3h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path d="M12 11v4" />
        <path d="M8 15h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
      </>
    ),
  },
  {
    id: "summarize",
    label: "Summarize",
    href: "/summarize",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </>
    ),
  },
  {
    id: "docchat",
    label: "Doc chat",
    href: "/doc-chat",
    icon: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M13 8H7M17 12H7" />
      </>
    ),
  },
  {
    id: "concept",
    label: "Concepts",
    href: "/concepts",
    icon: (
      <>
        <path d="M12 3a7 7 0 0 1 7 7c0 3-2 5.5-4 6.5V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-.5C7 15.5 5 13 5 10a7 7 0 0 1 7-7z" />
        <path d="M9 21h6M10 18h4" />
      </>
    ),
  },
  {
    id: "study",
    label: "Study",
    href: "/study",
    icon: (
      <>
        <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </>
    ),
  },
  {
    id: "resume",
    label: "Resume",
    href: "/resume",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h6" />
      </>
    ),
  },
  {
    id: "jobs",
    label: "Jobs",
    href: "/jobs",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v2" />
        <path d="M3 12h18" />
      </>
    ),
  },
  {
    id: "ai",
    label: "AI Coach",
    href: "/dashboard#ai",
    icon: (
      <>
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h-4V9.5A3.8 3.8 0 0 1 8 6a4 4 0 0 1 4-4z" />
        <path d="M9 11h6v2a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3v-2z" />
        <path d="M12 2v2M9 14l-2 8M15 14l2 8" />
      </>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard#settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </>
    ),
  },
] as const;

type DashboardLayoutProps = {
  children: ReactNode;
};

function activeIdFromHash(hash: string): (typeof navItems)[number]["id"] {
  if (hash === "#planner") return "planner";
  if (hash === "#courses") return "courses";
  if (hash === "#ai") return "ai";
  if (hash === "#settings") return "settings";
  if (hash === "#attendance") return "attendance";
  if (hash === "#summarize") return "summarize";
  if (hash === "#docchat") return "docchat";
  if (hash === "#concepts") return "concept";
  if (hash === "#study") return "study";
  if (hash === "#resume") return "resume";
  if (hash === "#jobs") return "jobs";
  if (hash === "#assignment") return "assignment";
  if (hash === "#lab") return "lab";
  return "overview";
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { hash, pathname } = useLocation();
  const loggedIn = isLoggedIn();
  const navigate = useNavigate();

  // Treat everything except the main dashboard as a "feature detail page".
  // On these pages we hide sidebar labels and show a back button.
  const isFeatureDetailPage = pathname !== "/dashboard";
  const showNavLabels = !isFeatureDetailPage;
  const showSidebar = !isFeatureDetailPage;

  const onBackToFeatures = () => {
    navigate("/#features");
  };
  const activeNav =
    pathname === "/timetable"
      ? "planner"
      : pathname === "/attendance"
        ? "attendance"
        : pathname === "/summarize"
          ? "summarize"
          : pathname === "/doc-chat"
            ? "docchat"
            : pathname === "/concepts"
              ? "concept"
              : pathname === "/study"
                ? "study"
                : pathname === "/resume"
                  ? "resume"
                  : pathname === "/jobs"
                    ? "jobs"
                  : pathname === "/assignment"
                    ? "assignment"
                    : pathname === "/lab"
                      ? "lab"
                      : pathname === "/flow-to-code"
                        ? "flowchart"
                        : activeIdFromHash(hash);

  return (
    <div className="dashboard-root relative min-h-screen overflow-x-hidden bg-[linear-gradient(165deg,#0B1220_0%,#020617_42%,#0a1428_100%)] text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_15%_-10%,rgba(108,99,255,0.18),transparent),radial-gradient(circle_at_90%_70%,rgba(0,212,255,0.08),transparent_42%)]"
        aria-hidden
      />

      {showSidebar ? (
        <aside className="dashboard-sidebar fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#6C63FF]/25 bg-slate-950/85 px-1 backdrop-blur-xl md:bottom-auto md:top-0 md:h-screen md:w-[4.5rem] md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:px-2 md:py-6 lg:w-60">
          <Link
            to="/"
            className="mb-0 hidden items-center gap-2 rounded-xl px-2 py-2 text-[#00D4FF] transition hover:bg-white/10 md:mb-3 md:flex lg:px-3"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#00D4FF] shadow-[0_0_12px_#00D4FF]" />
            <span className="hidden text-sm font-semibold tracking-wide lg:inline">Nexivo</span>
          </Link>

          {(loggedIn ? navItems : navItems.filter((item) => item.id !== "overview")).map((item) => {
            const active = item.id === activeNav;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`dashboard-nav-item flex items-center gap-3 rounded-xl px-2 py-2 transition md:w-full md:justify-center lg:justify-start lg:px-3 ${
                  active
                    ? "bg-[#6C63FF]/25 text-white shadow-[0_0_20px_rgba(108,99,255,0.35)]"
                    : "text-slate-400 hover:bg-white/8 hover:text-white"
                }`}
                title={item.label}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {item.icon}
                </svg>
                {showNavLabels ? (
                  <span className="hidden text-sm font-medium lg:inline">{item.label}</span>
                ) : null}
              </Link>
            );
          })}
        </aside>
      ) : null}

      <div
        className={`relative z-10 flex min-h-screen flex-col pb-20 md:pb-0 ${
          showSidebar ? "md:pl-[4.5rem] lg:pl-60" : "md:pl-0 lg:pl-0"
        }`}
      >
        <header className="dashboard-topbar sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-[#00D4FF]/15 bg-slate-950/55 px-3 py-3 backdrop-blur-xl sm:gap-4 sm:px-6">
          {isFeatureDetailPage ? (
            <>
              <button
                type="button"
                onClick={onBackToFeatures}
                className="neon-icon-btn flex shrink-0 items-center gap-2 rounded-xl px-2 py-2"
                aria-label="Nexivo AI logo - back to features"
                title="Back to Features"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_14px_#00D4FF]" />
                <span className="hidden text-sm font-semibold tracking-wide sm:inline">Nexivo AI</span>
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="neon-icon-btn flex shrink-0 items-center gap-2 rounded-xl px-2 py-2 md:hidden"
              aria-label="Home"
            >
              <span className="h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]" />
            </Link>
          )}

          <div className="neon-panel flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-3 py-2 sm:max-w-xl sm:px-4">
            <svg
              className="h-4 w-4 shrink-0 text-[#00D4FF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Search tasks, notes, courses…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              aria-label="Search"
            />
            <kbd className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-500 sm:inline">
              ⌘K
            </kbd>
          </div>

          <button
            type="button"
            className="neon-icon-btn relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-300 transition hover:text-white"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF6B6B] shadow-[0_0_8px_#FF6B6B]" />
          </button>

          <button
            type="button"
            className="neon-icon-btn flex shrink-0 items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 transition"
            aria-label="Profile menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] text-sm font-bold text-white shadow-[0_0_16px_rgba(108,99,255,0.45)]">
              NT
            </span>
            <span className="hidden text-left text-sm lg:block">
              <span className="block font-medium text-white">Nexivo</span>
              <span className="block text-xs text-slate-500">Pro Student</span>
            </span>
          </button>
        </header>

        <main className="dashboard-main flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-500 md:text-left">
          Nexivo AI Dashboard · Spring 2026
        </footer>
      </div>
    </div>
  );
};
