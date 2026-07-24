import type { Metadata } from "next";
import { Building2, HeartHandshake, Smartphone, Video } from "lucide-react";

import { GivingPanel } from "@/components/site/giving-panel";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { fetchContent } from "@/lib/appwrite-server";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Give",
  description: `Support the work of ${site.name} — locally and beyond.`,
};

export const dynamic = "force-dynamic";

const impact = [
  {
    Icon: Video,
    title: "The message goes further",
    body: "Cameras, encoders, streaming and storage so that every service reaches people who cannot be in the room.",
  },
  {
    Icon: HeartHandshake,
    title: "Neighbours get fed",
    body: "Food parcels, school fees and emergency support for families in our community.",
  },
  {
    Icon: Building2,
    title: "The doors stay open",
    body: "Rent, power, and the ordinary unglamorous costs of keeping a building ready every week.",
  },
];

const otherWays = [
  {
    Icon: Smartphone,
    title: "Mobile money",
    lines: ["Merchant ID: 000000", "Name: Centre of Grace Assembly"], // PLACEHOLDER
  },
  {
    Icon: Building2,
    title: "Bank transfer",
    lines: [
      "Bank: — ", // PLACEHOLDER
      "Account name: Centre of Grace Assembly",
      "Account number: —",
    ],
  },
];

export default async function GivePage() {
  const { site: siteContent } = await fetchContent();
  return (
    <>
      <PageHeader
        eyebrow="Generosity"
        title="Give, and keep the message going"
        description="Giving is worship. It is how a church that received grace freely gives it away — in this city and well beyond it."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_24rem] lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Where it goes"
              title="Every gift has a destination"
              description="We publish annual accounts and are happy to walk anyone through them. Ask any of the leadership team."
              className="max-w-none"
            />

            <Stagger className="mt-10 space-y-5">
              {impact.map(({ Icon, title, body }) => (
                <StaggerItem key={title}>
                  <div className="flex gap-5 rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-gold/40">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.2} className="mt-12">
              <h3 className="font-display text-xl font-semibold">
                Other ways to give
              </h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {otherWays.map(({ Icon, title, lines }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-border/70 bg-card p-6"
                  >
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h4 className="font-medium">{title}</h4>
                    <ul className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                      {lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                You can also give in person at any service — envelopes are at
                the welcome desk.
              </p>
            </Reveal>
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <Reveal direction="left">
              <GivingPanel givingUrl={siteContent.givingUrl} />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
