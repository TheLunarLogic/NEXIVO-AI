import type { InputHTMLAttributes } from "react";

type FloatingInputProps = {
  id: string;
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const FloatingInput = ({ id, label, className = "", ...props }: FloatingInputProps) => {
  return (
    <div className={`floating-field group relative ${className}`}>
      <input
        id={id}
        placeholder=" "
        className="auth-input peer w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 pb-2.5 pt-5 text-[15px] text-white outline-none transition-[border-color,box-shadow,background] duration-300 placeholder:text-transparent focus:border-[#6C63FF]/55"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-[1.125rem] z-[1] origin-left text-[15px] text-slate-400 transition-all duration-300 peer-focus:top-2.5 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-[#00D4FF] peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:-translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-slate-300"
      >
        {label}
      </label>
    </div>
  );
};
