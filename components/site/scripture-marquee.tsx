const verses = [
  "By grace you have been saved",
  "His mercies are new every morning",
  "Come to me, all who are weary",
  "The Lord is my shepherd",
  "Nothing can separate us from His love",
  "He restores my soul",
  "Be still, and know",
];

/**
 * Slow-scrolling band of verse fragments. Purely atmospheric, so it is hidden
 * from assistive tech and freezes under prefers-reduced-motion (see globals).
 */
export function ScriptureMarquee() {
  const row = [...verses, ...verses];

  return (
    <div
      aria-hidden
      className="edge-fade relative flex overflow-hidden border-y border-border/60 bg-card/30 py-6"
    >
      <div className="flex w-max animate-marquee items-center gap-10 pr-10">
        {row.map((verse, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-lg italic text-muted-foreground sm:text-2xl">
              {verse}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
