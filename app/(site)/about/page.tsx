import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Compass, Heart, Users } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { fetchContent } from "@/lib/appwrite-server";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, what we believe and who leads the church.",
};

export const dynamic = "force-dynamic";

// A small rotating icon set so added values still get an icon.
const valueIcons = [Heart, Users, Compass];

export default async function AboutPage() {
  const { about } = await fetchContent();
  const { leadership, beliefs, faqs, values, story } = about;

  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title={about.headerTitle}
        description={about.headerDescription}
      />

      {/* ---------------------------------------------------------- story */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="right">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1400&q=70"
                alt="The building where the church now meets"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {story.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90">
                <Link href="/connect">Plan your visit</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full font-semibold">
                <Link href="/messages">Listen to a message</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- values */}
      <section className="border-y border-border/60 bg-card/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="What shapes us"
            title="Three things we keep coming back to"
          />
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((value, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <StaggerItem key={i} className="h-full">
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-8 transition-colors hover:border-gold/40">
                    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-semibold">
                      {value.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {value.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------ leadership */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="The team"
          title="People you can actually talk to"
          description="Find any of us after a service. We would genuinely rather hear your questions than have you leave with them."
        />

        <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {leadership.map((person) => (
            <StaggerItem key={person.name} className="h-full">
              <div className="group h-full">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src={person.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {person.name}
                </h3>
                <p className="text-sm font-medium text-gradient-gold">
                  {person.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {person.bio}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* --------------------------------------------------------- beliefs */}
      <section className="border-y border-border/60 bg-card/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="What we believe"
            title="Ancient truths, plainly said"
          />
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beliefs.map((belief, i) => (
              <StaggerItem key={belief.title} className="h-full">
                <div className="h-full rounded-2xl border border-border/70 bg-card p-7">
                  <span className="font-mono text-xs font-semibold text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    {belief.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {belief.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------ faqs */}
      <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-28">
        <SectionHeading eyebrow="Before you come" title="Common questions" />
        <Reveal delay={0.1} className="mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
    </>
  );
}
