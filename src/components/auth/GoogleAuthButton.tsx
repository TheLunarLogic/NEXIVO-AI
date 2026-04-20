type Props = {
  label?: string;
};

export const GoogleAuthButton = ({ label = "Continue with Google" }: Props) => {
  return (
    <button
      type="button"
      className="google-auth-btn flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-slate-200 transition duration-300"
    >
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#EA4335"
          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.59 4.418 1.582l3.243-3.243C17.007 1.058 14.675 0 12 0 7.325 0 3.25 2.69 1.238 6.604l3.957 3.09Z"
        />
        <path
          fill="#34A853"
          d="M16.041 18.013c-1.189.855-2.813 1.434-4.705 1.434a7.077 7.077 0 0 1-6.327-3.89l-3.946 3.043C4.183 21.633 7.792 24 12.001 24c3.106 0 5.714-1.03 7.617-2.788l-3.575-2.957Z"
        />
        <path
          fill="#4A90E2"
          d="M19.618 20.212C21.511 18.483 22.704 15.9 22.704 12c0-.928-.126-1.835-.364-2.703H12v5.325h6.02c-.265 1.44-1.065 2.661-2.26 3.48l3.858 2.98Z"
        />
        <path
          fill="#FBBC05"
          d="M5.673 14.558a7.09 7.09 0 0 1 0-4.558L1.715 6.91A12.007 12.007 0 0 0 0 12c0 1.935.46 3.774 1.286 5.418l3.96-3.09Z"
        />
      </svg>
      {label}
    </button>
  );
};
