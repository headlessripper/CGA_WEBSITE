import { cn } from "@/lib/utils";

/**
 * The CGA mark: an open arc (a welcome, not a closed circle) around a cross,
 * drawn in the brand gold. Pure SVG so it stays crisp everywhere.
 */
export function Logo({
  className,
  showWordmark = true,
  invert = false,
}: {
  className?: string;
  showWordmark?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden
        className="h-9 w-9 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="cga-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold-soft)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <path
          d="M32 9.5A15 15 0 1 0 32 30.5"
          stroke="url(#cga-gold)"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <path
          d="M20 11.5v17M14.5 18h11"
          stroke="url(#cga-gold)"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.0625rem] font-semibold tracking-tight",
              invert ? "text-white" : "text-foreground",
            )}
          >
            Centre of Grace
          </span>
          <span
            className={cn(
              "mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em]",
              invert ? "text-white/60" : "text-muted-foreground",
            )}
          >
            Assembly
          </span>
        </span>
      )}
    </span>
  );
}
