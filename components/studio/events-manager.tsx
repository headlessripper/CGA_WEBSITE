"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEventAction, deleteEventAction } from "@/app/studio/actions";
import type { ChurchEvent } from "@/lib/events";
import { cn, formatShortDate } from "@/lib/utils";

const CATEGORIES: ChurchEvent["category"][] = [
  "Gathering",
  "Youth",
  "Outreach",
  "Training",
  "Special",
];

const BLANK = {
  title: "",
  start: "",
  end: "",
  location: "",
  category: "Gathering" as ChurchEvent["category"],
  description: "",
  image:
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=70",
  registrationUrl: "/connect",
};

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export function EventsManager({
  events,
  fromDatabase,
}: {
  events: ChurchEvent[];
  fromDatabase: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!draft.title.trim() || !draft.start) {
      setError("A title and start date/time are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await createEventAction({
      ...draft,
      slug: `${slugify(draft.title)}-${Date.now().toString(36)}`,
      end: draft.end || undefined,
      registrationUrl: draft.registrationUrl || undefined,
    });
    setSaving(false);
    if (res.ok) {
      setDraft(BLANK);
      router.refresh();
    } else setError(res.error);
  }

  async function remove(e: ChurchEvent) {
    if (!e.id) return;
    if (!confirm(`Delete “${e.title}”?`)) return;
    setBusyId(e.id);
    await deleteEventAction(e.id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h3 className="mb-4 font-display text-lg font-semibold">Add an event</h3>
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Starts</Label>
              <Input
                type="datetime-local"
                value={draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ends (optional)</Label>
              <Input
                type="datetime-local"
                value={draft.end}
                onChange={(e) => setDraft({ ...draft, end: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDraft({ ...draft, category: c })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    draft.category === c
                      ? "border-gold bg-gold/15"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="text-xs" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={create} disabled={saving} className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add event
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-lg font-semibold">
          Events{" "}
          {!fromDatabase && (
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
              template seed
            </span>
          )}
        </h3>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {events.map((e) => (
              <motion.div
                key={e.id ?? e.slug}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 truncate text-sm text-muted-foreground">
                    {formatShortDate(e.start)} · <MapPin className="h-3 w-3" /> {e.location}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!e.id || busyId === e.id}
                  title={e.id ? "Delete" : "Seed items can't be deleted"}
                  onClick={() => remove(e)}
                  className="h-9 w-9 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  {busyId === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
