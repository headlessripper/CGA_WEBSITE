"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESETS = [50, 100, 250, 500];
const FUNDS = [
  { value: "general", label: "Where most needed" },
  { value: "media", label: "Media & streaming" },
  { value: "outreach", label: "Community outreach" },
  { value: "building", label: "Building fund" },
] as const;

/**
 * Builds a pre-filled link to the church's giving provider.
 *
 * Card details are never collected here this hands off to the payment
 * processor's own hosted, PCI-compliant page. Set NEXT_PUBLIC_GIVING_URL to
 * the church's real checkout link before launch.
 */
export function GivingPanel({ givingUrl }: { givingUrl?: string }) {
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState<number | "">(100);
  const [fund, setFund] = useState<string>("general");

  const base =
    givingUrl ||
    process.env.NEXT_PUBLIC_GIVING_URL ||
    "https://give.example.org/cga"; // PLACEHOLDER
  const href = `${base}?frequency=${frequency}&fund=${fund}${
    amount ? `&amount=${amount}` : ""
  }`;

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-9">
      <div className="mb-7 flex rounded-full bg-muted p-1">
        {(["once", "monthly"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className={cn(
              "relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              frequency === f ? "text-ink" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {frequency === f && (
              <motion.span
                layoutId="give-freq"
                className="absolute inset-0 -z-10 rounded-full bg-gold"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {f === "once" ? "Give once" : "Give monthly"}
          </button>
        ))}
      </div>

      <Label className="mb-3 block">Amount</Label>
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset)}
            className={cn(
              "rounded-xl border py-3 font-display text-lg font-semibold transition-colors",
              amount === preset
                ? "border-gold bg-gold/15 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Label htmlFor="custom-amount" className="sr-only">
          Custom amount
        </Label>
        <Input
          id="custom-amount"
          type="number"
          min={1}
          inputMode="numeric"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Other amount"
          className="h-12 text-center font-display text-lg"
        />
      </div>

      <Label className="mb-3 mt-7 block">Give towards</Label>
      <div className="flex flex-wrap gap-2">
        {FUNDS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFund(f.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              fund === f.value
                ? "border-gold bg-gold/15 font-medium text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Button
        asChild
        size="lg"
        className="mt-8 h-14 w-full rounded-full bg-gold text-base font-semibold text-ink hover:bg-gold/90"
      >
        <a href={href} target="_blank" rel="noreferrer noopener">
          Continue to secure giving
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        You will finish on our payment provider&apos;s secure page. Centre of
        Grace Assembly never sees or stores your card details.
      </p>
    </div>
  );
}
