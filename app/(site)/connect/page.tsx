import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ConnectForm } from "@/components/site/connect-form";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { fetchContent } from "@/lib/appwrite-server";

export const metadata: Metadata = {
  title: "Connect",
  description: "Plan a visit, ask a question or request prayer.",
};

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const content = await fetchContent();
  const { site, serviceTimes, connect } = content;

  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title={connect.title}
        description={connect.description}
      />

      {/* ------------------------------------------------ connect plan */}
      {connect.plan.length > 0 && (
        <section className="border-b border-border/60 bg-card/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              align="left"
              eyebrow="How to connect"
              title="Three simple steps"
              className="max-w-xl"
            />
            <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
              {connect.plan.map((step, i) => (
                <StaggerItem key={i} className="h-full">
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-7">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 font-display text-lg font-semibold text-gold">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <Reveal>
            <ConnectForm />
          </Reveal>

          <Reveal direction="left" delay={0.15} className="space-y-8">
            <div className="rounded-2xl border border-border/70 bg-card p-7">
              <h2 className="font-display text-lg font-semibold">Find us</h2>
              <ul className="mt-5 space-y-5 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span className="text-muted-foreground">
                    {site.address.line1}
                    <br />
                    {site.address.line2}
                    <br />
                    {site.address.city}, {site.address.country}
                  </span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {site.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <a
                    href={`mailto:${site.email}`}
                    className="break-all text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="h-4 w-4 text-gold" />
                When we gather
              </h2>
              <ul className="mt-5 space-y-4 text-sm">
                {serviceTimes.map((service) => (
                  <li key={`${service.day}-${service.time}`}>
                    <p className="font-medium">
                      {service.day} · {service.time}
                    </p>
                    <p className="text-muted-foreground">{service.name}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-7">
              <h2 className="font-display text-lg font-semibold">
                Need to talk sooner?
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                If you are in crisis, please do not wait for a reply here. Call
                the church office during the week, or contact your local
                emergency services.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
