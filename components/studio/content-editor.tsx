"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveContentAction } from "@/app/studio/actions";
import type { ContentSection, SiteContent } from "@/lib/content";
import { cn } from "@/lib/utils";

const SECTIONS: { key: ContentSection; label: string }[] = [
  { key: "site", label: "Church details" },
  { key: "home", label: "Home hero" },
  { key: "serviceTimes", label: "Service times" },
  { key: "connect", label: "Connect plan" },
];

export function ContentEditor({ content }: { content: SiteContent }) {
  const [active, setActive] = useState<ContentSection>("site");

  return (
    <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-left text-sm font-medium transition-colors lg:rounded-xl",
              active === s.key
                ? "bg-gold/15 text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div>
        {active === "site" && <SiteForm value={content.site} />}
        {active === "home" && <HomeForm value={content.home} />}
        {active === "serviceTimes" && (
          <ServiceTimesForm value={content.serviceTimes} />
        )}
        {active === "connect" && <ConnectForm value={content.connect} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- shared ---- */

function useSaver(section: ContentSection) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function save(value: unknown) {
    setStatus("saving");
    setError(null);
    const res = await saveContentAction(section, value);
    if (res.ok) {
      setStatus("done");
      router.refresh();
      setTimeout(() => setStatus("idle"), 1800);
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  return { status, error, save };
}

function SaveBar({
  status,
  error,
  onSave,
}: {
  status: "idle" | "saving" | "done" | "error";
  error: string | null;
  onSave: () => void;
}) {
  return (
    <div className="mt-8 flex items-center gap-4">
      <Button
        onClick={onSave}
        disabled={status === "saving"}
        className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
      >
        {status === "saving" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Saved
          </>
        ) : (
          "Save changes"
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------- forms ---- */

function SiteForm({ value }: { value: SiteContent["site"] }) {
  const [v, setV] = useState(value);
  const { status, error, save } = useSaver("site");
  const set = (patch: Partial<SiteContent["site"]>) =>
    setV((cur) => ({ ...cur, ...patch }));

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Church name" value={v.name} onChange={(name) => set({ name })} />
      <Field label="Tagline" value={v.tagline} onChange={(tagline) => set({ tagline })} />
      <Field
        label="Description"
        value={v.description}
        onChange={(description) => set({ description })}
        textarea
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" value={v.email} onChange={(email) => set({ email })} />
        <Field label="Phone" value={v.phone} onChange={(phone) => set({ phone })} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Address line 1"
          value={v.address.line1}
          onChange={(line1) => set({ address: { ...v.address, line1 } })}
        />
        <Field
          label="Address line 2"
          value={v.address.line2}
          onChange={(line2) => set({ address: { ...v.address, line2 } })}
        />
        <Field
          label="City"
          value={v.address.city}
          onChange={(city) => set({ address: { ...v.address, city } })}
        />
        <Field
          label="Country"
          value={v.address.country}
          onChange={(country) => set({ address: { ...v.address, country } })}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="YouTube URL"
          value={v.socials.youtube}
          onChange={(youtube) => set({ socials: { ...v.socials, youtube } })}
        />
        <Field
          label="Facebook URL"
          value={v.socials.facebook}
          onChange={(facebook) => set({ socials: { ...v.socials, facebook } })}
        />
        <Field
          label="Instagram URL"
          value={v.socials.instagram}
          onChange={(instagram) => set({ socials: { ...v.socials, instagram } })}
        />
        <Field
          label="Giving link"
          value={v.givingUrl}
          onChange={(givingUrl) => set({ givingUrl })}
        />
      </div>
      <SaveBar status={status} error={error} onSave={() => save(v)} />
    </div>
  );
}

function HomeForm({ value }: { value: SiteContent["home"] }) {
  const [v, setV] = useState(value);
  const { status, error, save } = useSaver("home");
  const set = (patch: Partial<SiteContent["home"]>) =>
    setV((cur) => ({ ...cur, ...patch }));

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Badge" value={v.heroBadge} onChange={(heroBadge) => set({ heroBadge })} />
      <Field label="Headline" value={v.heroTitle} onChange={(heroTitle) => set({ heroTitle })} />
      <Field
        label="Subtitle"
        value={v.heroSubtitle}
        onChange={(heroSubtitle) => set({ heroSubtitle })}
        textarea
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Primary button"
          value={v.primaryCta}
          onChange={(primaryCta) => set({ primaryCta })}
        />
        <Field
          label="Secondary button"
          value={v.secondaryCta}
          onChange={(secondaryCta) => set({ secondaryCta })}
        />
      </div>
      <div className="space-y-2">
        <Label>Feature highlights (one per line)</Label>
        <Textarea
          value={v.features.join("\n")}
          onChange={(e) =>
            set({ features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
          }
          rows={3}
        />
      </div>
      <SaveBar status={status} error={error} onSave={() => save(v)} />
    </div>
  );
}

function ServiceTimesForm({
  value,
}: {
  value: SiteContent["serviceTimes"];
}) {
  const [rows, setRows] = useState(value);
  const { status, error, save } = useSaver("serviceTimes");
  const setRow = (i: number, patch: Partial<(typeof value)[number]>) =>
    setRows((cur) => cur.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="max-w-2xl space-y-4">
      {rows.map((r, i) => (
        <div key={i} className="rounded-xl border border-border/70 bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Service {i + 1}
            </span>
            <button
              type="button"
              onClick={() => setRows((cur) => cur.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={r.name} onChange={(name) => setRow(i, { name })} />
            <Field label="Day" value={r.day} onChange={(day) => setRow(i, { day })} />
            <Field label="Time (display)" value={r.time} onChange={(time) => setRow(i, { time })} />
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="Wkday 0–6" value={r.weekday} onChange={(weekday) => setRow(i, { weekday })} />
              <NumberField label="Hour 0–23" value={r.startHour} onChange={(startHour) => setRow(i, { startHour })} />
              <NumberField label="Min" value={r.startMinute} onChange={(startMinute) => setRow(i, { startMinute })} />
            </div>
          </div>
          <div className="mt-4">
            <Field label="Detail" value={r.detail} onChange={(detail) => setRow(i, { detail })} textarea />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setRows((cur) => [
            ...cur,
            { day: "Sunday", time: "9:00 AM", name: "New service", detail: "", weekday: 0, startHour: 9, startMinute: 0 },
          ])
        }
        className="rounded-full"
      >
        <Plus className="mr-2 h-4 w-4" /> Add a service
      </Button>

      <p className="text-xs text-muted-foreground">
        Weekday drives the live homepage countdown: 0 = Sunday … 6 = Saturday.
      </p>
      <SaveBar status={status} error={error} onSave={() => save(rows)} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ConnectForm({ value }: { value: SiteContent["connect"] }) {
  const [v, setV] = useState(value);
  const { status, error, save } = useSaver("connect");

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Heading" value={v.title} onChange={(title) => setV((c) => ({ ...c, title }))} />
      <Field
        label="Intro"
        value={v.description}
        onChange={(description) => setV((c) => ({ ...c, description }))}
        textarea
      />

      <div className="space-y-4">
        <Label>Connect plan steps</Label>
        {v.plan.map((step, i) => (
          <div key={i} className="rounded-xl border border-border/70 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Step {i + 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  setV((c) => ({ ...c, plan: c.plan.filter((_, idx) => idx !== i) }))
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Field
                label="Title"
                value={step.title}
                onChange={(title) =>
                  setV((c) => ({
                    ...c,
                    plan: c.plan.map((p, idx) => (idx === i ? { ...p, title } : p)),
                  }))
                }
              />
              <Field
                label="Body"
                value={step.body}
                textarea
                onChange={(body) =>
                  setV((c) => ({
                    ...c,
                    plan: c.plan.map((p, idx) => (idx === i ? { ...p, body } : p)),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setV((c) => ({ ...c, plan: [...c.plan, { title: "New step", body: "" }] }))
          }
          className="rounded-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Add a step
        </Button>
      </div>

      <SaveBar status={status} error={error} onSave={() => save(v)} />
    </div>
  );
}
