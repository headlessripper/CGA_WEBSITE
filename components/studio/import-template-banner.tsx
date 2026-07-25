"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importTemplateAction } from "@/app/studio/actions";

/**
 * Shown in the Messages and Events managers while they are still displaying the
 * read-only template seed. One click copies the template into the database so
 * every item becomes a real record the team can edit and delete.
 */
export function ImportTemplateBanner({ what }: { what: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importNow() {
    setBusy(true);
    setError(null);
    const res = await importTemplateAction();
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(res.error);
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            These {what} are still the starter template.
          </span>{" "}
          Import them into the database to edit, reorder or delete them or just
          start publishing your own.
          {error && <span className="mt-1 block text-destructive">{error}</span>}
        </p>
      </div>
      <Button
        onClick={importNow}
        disabled={busy}
        className="shrink-0 rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing…
          </>
        ) : (
          "Import the template"
        )}
      </Button>
    </div>
  );
}
