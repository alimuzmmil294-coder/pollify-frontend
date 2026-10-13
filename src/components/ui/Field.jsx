export function Label({ className = "", children, ...props }) {
  return (
    <label
      className={`block text-[11px] font-semibold tracking-widest text-[var(--color-text-faint)] ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-brand)]/70 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-brand)]/70 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
