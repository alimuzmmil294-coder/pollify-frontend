const variants = {
  default:
    "bg-[var(--color-brand)] text-black hover:bg-[var(--color-brand-dim)]",
  secondary:
    "bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:bg-[var(--color-border-light)]",
  outline:
    "border border-[var(--color-border-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
  ghost:
    "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
  destructive: "bg-red-500 text-white hover:bg-red-600",
};
const sizes = {
  sm: "h-9 px-3 text-xs",
  default: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
