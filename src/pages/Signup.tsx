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

const Signup = () => {
  const navigate = useNavigate();

  return (
    <motion.div className="min-h-screen" {...pageMotion}>
      <AuthSplitLayout
        title="Create your workspace"
        subtitle="Start your free trial—smart planning, AI notes, and focus tools in one place."
        footer={
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#00D4FF] transition hover:text-[#6C63FF]"
            >
              Sign in
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
            id="signup-name"
            name="name"
            type="text"
            label="Full name"
            autoComplete="name"
            required
          />
          <FloatingInput
            id="signup-email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
          />
          <FloatingInput
            id="signup-password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <FloatingInput
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-slate-500">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
          <button type="submit" className="btn-glow-primary w-full rounded-2xl py-3.5 text-base font-semibold">
            Create account
          </button>
        </form>

        <div className="relative flex items-center gap-4 py-1">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleAuthButton label="Sign up with Google" />
      </AuthSplitLayout>
    </motion.div>
  );
};

export default Signup;
