import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthIllustration } from "./AuthIllustration";
import { AuthParticles } from "./AuthParticles";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export const AuthSplitLayout = ({ title, subtitle, children, footer }: Props) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-[linear-gradient(155deg,#0F172A_0%,#020617_55%,#0a1628_100%)] text-white lg:flex-row">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(108,99,255,0.18),transparent),radial-gradient(circle_at_80%_80%,rgba(0,212,255,0.08),transparent_45%)]" />
      <AuthParticles />

      {/* Illustration — top on mobile, left on desktop */}
      <div className="relative z-[1] flex min-h-[38vh] items-stretch border-b border-white/10 lg:min-h-screen lg:w-[48%] lg:border-b-0 lg:border-r">
        <AuthIllustration />
      </div>

      {/* Form panel */}
      <div className="relative z-[1] flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:px-16 xl:px-20">
        <Link
          to="/"
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-[#00D4FF]"
        >
          <span className="h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]" />
          Nexivo AI
        </Link>
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">{subtitle}</p>
          <div className="mt-8 space-y-6">{children}</div>
          <div className="mt-8 text-center text-sm text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  );
};
