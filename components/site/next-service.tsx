"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CalendarClock } from "lucide-react";

import { serviceTimes as seedServiceTimes, type ServiceTime } from "@/lib/site";
import { cn } from "@/lib/utils";

function nextOccurrence(service: ServiceTime, from: Date) {
  const date = new Date(from);
  const daysAhead = (service.weekday - from.getDay() + 7) % 7;
  date.setDate(from.getDate() + daysAhead);
  date.setHours(service.startHour, service.startMinute, 0, 0);
  if (date.getTime() <= from.getTime()) date.setDate(date.getDate() + 7);
  return date;
}

function findNext(services: ServiceTime[], from: Date) {
  return services
    .map((service) => ({ service, at: nextOccurrence(service, from) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];
}

/**
 * Live countdown to the next gathering.
 *
 * Rendered only after mount — the server and the visitor are in different time
 * zones, so computing this during SSR would guarantee a hydration mismatch.
 */
export function NextService({
  className,
  tone = "light",
  services = seedServiceTimes,
}: {
  className?: string;
  tone?: "light" | "dark";
  services?: ServiceTime[];
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <div className={cn("h-[4.5rem]", className)} aria-hidden />;
  }

  const next = findNext(services, now);
  const diff = Math.max(0, next.at.getTime() - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const minutes = Math.floor((diff / 60_000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const units = [
    { value: days, label: days === 1 ? "day" : "days" },
    { value: hours, label: "hrs" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];

  const dark = tone === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border px-6 py-5 backdrop-blur-md sm:flex-row sm:justify-between",
        dark
          ? "border-border/70 bg-card/60"
          : "border-white/15 bg-white/10 text-white",
        className,
      )}
    >
      <div className="flex items-center gap-3 text-left">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            dark ? "bg-gold/15 text-gold" : "bg-white/15 text-gold",
          )}
        >
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <p
            className={cn(
              "text-[0.65rem] font-semibold uppercase tracking-[0.2em]",
              dark ? "text-muted-foreground" : "text-white/60",
            )}
          >
            Next gathering
          </p>
          <p className="text-sm font-semibold">
            {next.service.name} · {next.service.day} {next.service.time}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {units.map((unit) => (
          <div key={unit.label} className="text-center">
            <div
              className={cn(
                "min-w-[3rem] rounded-lg px-2 py-1.5 font-mono text-xl font-semibold tabular-nums",
                dark ? "bg-muted text-foreground" : "bg-white/10 text-white",
              )}
            >
              {unit.value.toString().padStart(2, "0")}
            </div>
            <div
              className={cn(
                "mt-1 text-[0.6rem] font-medium uppercase tracking-widest",
                dark ? "text-muted-foreground" : "text-white/50",
              )}
            >
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
