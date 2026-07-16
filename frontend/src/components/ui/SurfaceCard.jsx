export default function SurfaceCard({
  children,
  className = "",
  interactive = false,
}) {
  return (
    <article
      className={[
        "rounded-[24px] border border-white/80 bg-white/80",
        "shadow-[0_10px_35px_rgba(36,42,89,0.06)] backdrop-blur-xl",
        interactive
          ? "transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)]"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </article>
  );
}