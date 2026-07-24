"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Headphones, Loader2, Pencil, Star, Trash2, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MessageComposer } from "@/components/site/message-composer";
import { deleteMessageAction } from "@/app/studio/actions";
import type { Message } from "@/lib/messages";
import { cn, formatShortDate } from "@/lib/utils";

export function MessagesManager({
  messages,
  fromDatabase,
  speakerOptions,
  seriesOptions,
}: {
  messages: Message[];
  fromDatabase: boolean;
  speakerOptions: string[];
  seriesOptions: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(m: Message) {
    if (!m.id) return;
    if (!confirm(`Delete “${m.title}”? This cannot be undone.`)) return;
    setDeletingId(m.id);
    const res = await deleteMessageAction(m.id);
    setDeletingId(null);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  if (editing) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" /> Cancel edit
        </button>
        <h3 className="mb-6 font-display text-xl font-semibold">
          Editing “{editing.title}”
        </h3>
        <MessageComposer
          existing={editing}
          speakerOptions={speakerOptions}
          seriesOptions={seriesOptions}
          onPublished={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
          {!fromDatabase && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              showing template seed — publish one to start your library
            </span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id ?? m.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {m.featured && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" />
                  )}
                  <p className="truncate font-medium">{m.title}</p>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {m.speaker} · {m.series} · {formatShortDate(m.date)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                {m.video && <Video className="h-4 w-4" />}
                {m.audio && <Headphones className="h-4 w-4" />}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!m.id}
                  title={m.id ? "Edit" : "Seed items can't be edited — publish first"}
                  onClick={() => setEditing(m)}
                  className="h-9 w-9 rounded-full"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!m.id || deletingId === m.id}
                  onClick={() => remove(m)}
                  className={cn(
                    "h-9 w-9 rounded-full",
                    m.id && "hover:bg-destructive/10 hover:text-destructive",
                  )}
                >
                  {deletingId === m.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
