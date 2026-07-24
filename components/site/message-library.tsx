"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Headphones, Search, SlidersHorizontal, Video, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCard } from "@/components/site/message-card";
import type { Message, MessageFormat } from "@/lib/messages";
import { cn } from "@/lib/utils";

type FormatFilter = "all" | MessageFormat;
type SortOrder = "newest" | "oldest" | "longest";

export function MessageLibrary({ messages }: { messages: Message[] }) {
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState<string>("All");
  const [speaker, setSpeaker] = useState<string>("All");
  const [format, setFormat] = useState<FormatFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allSeries = useMemo(
    () => ["All", ...Array.from(new Set(messages.map((m) => m.series))).sort()],
    [messages],
  );
  const allSpeakers = useMemo(
    () => ["All", ...Array.from(new Set(messages.map((m) => m.speaker))).sort()],
    [messages],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = messages.filter((m) => {
      if (series !== "All" && m.series !== series) return false;
      if (speaker !== "All" && m.speaker !== speaker) return false;
      if (format !== "all" && !m.formats.includes(format)) return false;
      if (!q) return true;
      return [m.title, m.speaker, m.series, m.scripture, m.summary, ...(m.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    return filtered.sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "longest") return b.durationSeconds - a.durationSeconds;
      return b.date.localeCompare(a.date);
    });
  }, [messages, query, series, speaker, format, sort]);

  const activeFilters =
    (series !== "All" ? 1 : 0) +
    (speaker !== "All" ? 1 : 0) +
    (format !== "all" ? 1 : 0);

  function reset() {
    setQuery("");
    setSeries("All");
    setSpeaker("All");
    setFormat("all");
    setSort("newest");
  }

  return (
    <div>
      {/* -------------------------------------------------------- controls */}
      <div className="sticky top-[72px] z-30 -mx-5 mb-8 border-y border-border/60 bg-background/85 px-5 py-4 backdrop-blur-xl lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, speaker, series or scripture…"
              className="h-11 rounded-full pl-10 pr-10"
              aria-label="Search messages"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FormatToggle value={format} onChange={setFormat} />

            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersOpen((v) => !v)}
              className="h-11 shrink-0 gap-2 rounded-full"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <Badge className="ml-0.5 h-5 min-w-5 justify-center bg-gold px-1 text-[0.65rem] text-ink hover:bg-gold">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                <FilterRow label="Series" options={allSeries} value={series} onChange={setSeries} />
                <FilterRow
                  label="Speaker"
                  options={allSpeakers}
                  value={speaker}
                  onChange={setSpeaker}
                />
                <FilterRow
                  label="Sort"
                  options={["newest", "oldest", "longest"]}
                  labels={{ newest: "Newest first", oldest: "Oldest first", longest: "Longest" }}
                  value={sort}
                  onChange={(v) => setSort(v as SortOrder)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --------------------------------------------------------- results */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span>{" "}
          {results.length === 1 ? "message" : "messages"}
          {query && (
            <>
              {" "}
              for &ldquo;<span className="text-foreground">{query}</span>&rdquo;
            </>
          )}
        </p>
        {(activeFilters > 0 || query) && (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-border py-20 text-center"
        >
          <p className="font-display text-2xl font-semibold">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            No message matches that search. Try a different word, or clear the
            filters to see everything.
          </p>
          <Button onClick={reset} variant="outline" className="mt-6 rounded-full">
            Clear filters
          </Button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {results.map((message, i) => (
              <motion.div
                key={message.slug}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(i * 0.04, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <MessageCard message={message} priority={i < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FormatToggle({
  value,
  onChange,
}: {
  value: FormatFilter;
  onChange: (v: FormatFilter) => void;
}) {
  const options: { value: FormatFilter; label: string; Icon?: typeof Video }[] = [
    { value: "all", label: "All" },
    { value: "video", label: "Watch", Icon: Video },
    { value: "audio", label: "Listen", Icon: Headphones },
  ];

  return (
    <div className="flex h-11 shrink-0 items-center rounded-full bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors sm:px-4",
            value === o.value
              ? "text-ink"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId="format-pill"
              className="absolute inset-0 -z-10 rounded-full bg-gold"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          {o.Icon && <o.Icon className="h-3.5 w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="edge-fade -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              value === option
                ? "border-gold bg-gold/15 font-medium text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {labels?.[option] ?? option}
          </button>
        ))}
      </div>
    </div>
  );
}
