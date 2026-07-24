"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Mail, Phone, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteConnectionAction,
  setConnectionStatusAction,
} from "@/app/studio/actions";
import type { ConnectionRecord } from "@/lib/appwrite-server";
import { cn, formatShortDate } from "@/lib/utils";

const REASON_LABELS: Record<string, string> = {
  "first-visit": "First visit",
  prayer: "Prayer",
  serve: "Wants to serve",
  "small-group": "Small group",
  baptism: "Baptism",
  other: "Other",
};

export function ConnectionsInbox({
  connections,
}: {
  connections: ConnectionRecord[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markHandled(c: ConnectionRecord) {
    setBusyId(c.id);
    await setConnectionStatusAction(c.id, c.status === "handled" ? "new" : "handled");
    setBusyId(null);
    router.refresh();
  }

  async function remove(c: ConnectionRecord) {
    if (!confirm("Delete this message permanently?")) return;
    setBusyId(c.id);
    await deleteConnectionAction(c.id);
    setBusyId(null);
    router.refresh();
  }

  if (connections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="font-display text-xl font-semibold">No messages yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          When someone reaches out through the Connect page, it lands here.
        </p>
      </div>
    );
  }

  const newCount = connections.filter((c) => c.status !== "handled").length;

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {connections.length} total · <span className="font-medium text-foreground">{newCount}</span> new
      </p>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {connections.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "rounded-xl border bg-card p-5",
                c.status === "handled"
                  ? "border-border/60 opacity-70"
                  : "border-gold/30",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{c.name}</p>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold">
                      {REASON_LABELS[c.reason] ?? c.reason}
                    </span>
                    {c.status === "handled" && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                        handled
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                      <Mail className="h-3 w-3" /> {c.email}
                    </a>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </a>
                    )}
                    <span>{formatShortDate(c.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={busyId === c.id}
                    onClick={() => markHandled(c)}
                    title={c.status === "handled" ? "Mark as new" : "Mark handled"}
                    className={cn(
                      "h-9 w-9 rounded-full",
                      c.status !== "handled" && "hover:bg-gold/10 hover:text-gold",
                    )}
                  >
                    {busyId === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={busyId === c.id}
                    onClick={() => remove(c)}
                    className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {c.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
