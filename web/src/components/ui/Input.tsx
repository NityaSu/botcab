import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, leading, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label;
  return (
    <label htmlFor={inputId} className="block">
      {label && <span className="block text-sm font-medium text-neutral-600 mb-1.5">{label}</span>}
      <span
        className={`flex items-center gap-2 rounded-xl border bg-neutral-50 px-4 py-3 focus-within:border-ink focus-within:bg-white transition-colors ${
          error ? "border-red-500" : "border-neutral-200"
        }`}
      >
        {leading}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-transparent outline-none text-base placeholder:text-neutral-400 ${className}`}
          {...rest}
        />
      </span>
      {error ? (
        <span className="block text-sm text-red-600 mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-neutral-500 mt-1">{hint}</span>
      ) : null}
    </label>
  );
});
