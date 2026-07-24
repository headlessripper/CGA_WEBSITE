import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

/** Shared top-of-page block for every inner route. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-border/60 bg-card/30 pb-16 pt-[9.5rem] lg:pb-20 lg:pt-[11rem]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gradient-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </header>
  );
}
