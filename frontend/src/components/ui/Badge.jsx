const styles = {
  indigo: "bg-indigo-100 text-indigo-700",
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  coral: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

export default function Badge({
  children,
  tone = "indigo",
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[tone] ?? styles.indigo
      } ${className}`}
    >
      {children}
    </span>
  );
}