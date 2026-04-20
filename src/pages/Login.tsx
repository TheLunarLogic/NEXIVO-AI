import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AuthSplitLayout } from "../components/auth/AuthSplitLayout";
import { FloatingInput } from "../components/auth/FloatingInput";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { setLoggedIn } from "../utils/auth";

const pageMotion = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

const Login = () => {
  const navigate = useNavigate();

  return (
    <motion.div className="min-h-screen" {...pageMotion}>
      <AuthSplitLayout
        title="Welcome back"
        subtitle="Sign in to pick up your study streak right where you left off."
        footer={
          <>
            New to Nexivo?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#00D4FF] transition hover:text-[#6C63FF]"
            >
              Create an account
            </Link>
          </>
        }
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setLoggedIn();
            navigate("/dashboard");
          }}
        >
          <FloatingInput
            id="login-email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
          />
          <FloatingInput
            id="login-password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-[#00D4FF] transition hover:text-white"
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn-glow-primary w-full rounded-2xl py-3.5 text-base font-semibold">
            Sign in
          </button>
        </form>

        <div className="relative flex items-center gap-4 py-1">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleAuthButton label="Continue with Google" />
      </AuthSplitLayout>
    </motion.div>
  );
};

export default Login;
