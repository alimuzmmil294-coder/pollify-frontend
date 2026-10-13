export function Card({ className = "", children, ...props }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h2 className={`text-base font-semibold tracking-tight ${className}`}>
      {children}
    </h2>
  );
}
