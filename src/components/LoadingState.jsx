export default function LoadingState({
  label = "Loading...",
  fullScreen = false,
}) {
  return (
    <div
      className={`${fullScreen ? "min-h-screen" : "py-16"} flex flex-col items-center justify-center gap-3 text-sm text-[var(--color-text-muted)]`}
    >
      <span
        aria-hidden="true"
        className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent"
      />
      {label}
    </div>
  );
}
