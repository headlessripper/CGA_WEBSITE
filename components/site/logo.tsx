import { cn } from "@/lib/utils";

/**
 * The CGA emblem: a cross rising over the globe, cradled by the open Word.
 * A single-material gold mark a calmer, refined take on the church's symbols
 * (world, cross, scripture) without the clashing colours of the original.
 * Pure SVG so it stays crisp everywhere.
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
        viewBox="0 0 48 48"
        aria-hidden
        className="h-9 w-9 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="cga-gold" x1="10" y1="4" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--gold-soft)" />
            <stop offset="55%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-soft)" />
          </linearGradient>
        </defs>

        {/* Globe: ring + tilted equator + meridian */}
        <g stroke="url(#cga-gold)" fill="none" strokeLinecap="round">
          <circle cx="24" cy="20" r="8.7" strokeWidth="1.7" />
          <ellipse cx="24" cy="20" rx="8.7" ry="3.2" strokeWidth="1" opacity="0.5" />
          <ellipse cx="24" cy="20" rx="3.2" ry="8.7" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Cross, rising over the globe */}
        <g fill="url(#cga-gold)">
          <rect x="22.85" y="3.4" width="2.3" height="25.2" rx="1.15" />
          <rect x="18.9" y="8.8" width="10.2" height="2.3" rx="1.15" />
        </g>

        {/* Sword of the Spirit, crossing the globe */}
        <g fill="url(#cga-gold)" transform="translate(30 15) rotate(45)">
          <circle cx="0" cy="-11.8" r="1.5" />
          <rect x="-0.7" y="-10.8" width="1.4" height="2.7" rx="0.6" />
          <rect x="-3.3" y="-8.5" width="6.6" height="1.7" rx="0.85" />
          <path d="M-1.15 -7 L1.15 -7 L1 3 L0 7 L-1 3 Z" />
        </g>

        {/* Open book cradling the globe */}
        <g fill="url(#cga-gold)" transform="translate(0 3)">
          <path d="M24 31.6c-3.6-1.9-8.7-1.9-12.5-.2-.8.4-1.4 1.2-1.4 2.1v4c0 .7.6 1.1 1.3.8 3.5-1.5 8.1-1.4 11.6.4.3.2.7.2 1 0 3.4-1.8 8-1.9 11.6-.4.6.3 1.3-.1 1.3-.8v-4c0-.9-.5-1.7-1.4-2.1-3.8-1.7-8.9-1.7-12.5.2-.1.1-.3.1-.4 0Z" />
          <rect x="23.3" y="31.1" width="1.4" height="7.4" rx="0.7" opacity="0.85" />
        </g>
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
