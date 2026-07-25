"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const reasons = [
  { value: "first-visit", label: "Planning my first visit" },
  { value: "prayer", label: "I'd like prayer" },
  { value: "serve", label: "I want to serve" },
  { value: "small-group", label: "Join a small group" },
  { value: "baptism", label: "Baptism" },
  { value: "other", label: "Something else" },
] as const;

type Status = "idle" | "sending" | "sent" | "error";

export function ConnectForm() {
  const [reason, setReason] = useState<string>("first-visit");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
      reason,
    };

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="relative rounded-3xl border border-border/70 bg-card p-6 sm:p-10">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.span>
            <h3 className="font-display text-2xl font-semibold">
              Thank you we&apos;ve got it
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
              Someone from the team will be in touch within a couple of days. If
              it is urgent, please call the church office.
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-full"
              onClick={() => setStatus("idle")}
            >
              Send another
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <fieldset>
              <legend className="mb-3 text-sm font-medium">
                What is this about?
              </legend>
              <div className="flex flex-wrap gap-2">
                {reasons.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    aria-pressed={reason === r.value}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      reason === r.value
                        ? "border-gold bg-gold/15 font-medium text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Tell us a little more</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="However much or little you want to say…"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={status === "sending"}
                className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send it
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Prayer requests go only to the pastoral team.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
