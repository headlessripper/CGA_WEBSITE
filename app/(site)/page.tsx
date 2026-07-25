import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  Flame,
  HeartHandshake,
  MapPin,
  Music,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/site/count-up";
import { FeaturedMessage } from "@/components/site/featured-message";
import { HomeHero } from "@/components/site/home-hero";
import { MessageCard } from "@/components/site/message-card";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ScriptureMarquee } from "@/components/site/scripture-marquee";
import { SectionHeading } from "@/components/site/section-heading";
import {
  fetchContent,
  fetchFeaturedMessage,
  fetchMessages,
  fetchUpcomingEvents,
} from "@/lib/appwrite-server";
import { ministries } from "@/lib/site";
import { formatShortDate } from "@/lib/utils";

const ministryIcons = { Baby, Flame, Music, HeartHandshake } as const;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, messages, featured, upcomingAll] = await Promise.all([
    fetchContent(),
    fetchMessages(),
    fetchFeaturedMessage(),
    fetchUpcomingEvents(),
  ]);
  const serviceTimes = content.serviceTimes;
  const site = content.site;
  const latest = messages.filter((m) => m.slug !== featured?.slug).slice(0, 3);
  const upcoming = upcomingAll.slice(0, 3);

  return (
    <>
      <HomeHero home={content.home} services={content.serviceTimes} />

      <ScriptureMarquee />

      {/* ------------------------------------------------------ welcome */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="right">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=70"
                  alt="The congregation gathered on a Sunday morning"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 hidden w-56 rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:block lg:-right-8">
                <p className="font-display text-4xl font-semibold text-gradient-gold">
                  <CountUp value={17} suffix="" />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  years of gathering, growing and giving in {site.address.city}.
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="You are welcome here"
              title="Come as you are. Leave different."
              description="We are an ordinary church full of ordinary people who have been changed by an extraordinary grace. There is no dress code, no insider language and no expectation that you have it together."
              className="max-w-none"
            />

            <Reveal delay={0.15}>
              <div className="mt-10 space-y-4">
                {serviceTimes.slice(0, 3).map((service) => (
                  <div
                    key={`${service.day}-${service.time}`}
                    className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-gold/40"
                  >
                    <div className="flex w-24 shrink-0 flex-col">
                      <span className="font-display text-lg font-semibold">
                        {service.time}
                      </span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {service.day}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{service.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {service.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90">
                  <Link href="/connect">
                    Plan your visit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold">
                  <Link href="/about">Read our story</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- featured message */}
      {featured && (
        <section className="relative overflow-hidden border-y border-border/60 bg-card/30 py-24 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <FeaturedMessage message={featured} />
          </div>
        </section>
      )}

      {/* ----------------------------------------------- latest messages */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="The message library"
            title="Catch up on what you missed"
            description="Every service is published here in video and audio. Stream it, download it, or put it on in the background while you drive."
            className="max-w-2xl"
          />
          <Reveal delay={0.2}>
            <Button asChild variant="outline" className="shrink-0 rounded-full font-semibold">
              <Link href="/messages">
                Browse all messages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((message) => (
            <StaggerItem key={message.slug} className="h-full">
              <MessageCard message={message} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------------------------------- statistics */}
      <section className="border-y border-border/60 bg-card/30 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 lg:grid-cols-4 lg:px-8">
          {[
            { value: 420, suffix: "+", label: "Messages published" },
            { value: 62, suffix: "", label: "Countries watching" },
            { value: 18, suffix: "", label: "Small groups meeting" },
            { value: 1400, suffix: "+", label: "Weekly gatherers" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center">
              <p className="font-display text-4xl font-semibold text-gradient-gold sm:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- ministries */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow="Find your people"
          title="There is a place for you here"
          description="Church is not a building you attend, it is a family you belong to. Here is where most people start."
        />

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ministries.map((ministry) => {
            const Icon = ministryIcons[ministry.icon];
            return (
              <StaggerItem key={ministry.title} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-2xl border border-border/70">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={ministry.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-gold backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {ministry.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70 transition-all duration-500 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-40 lg:group-hover:opacity-100">
                      {ministry.description}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* --------------------------------------------------------- events */}
      <section className="border-y border-border/60 bg-card/30 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="What's coming up"
              title="More than Sundays"
              className="max-w-xl"
            />
            <Reveal delay={0.2}>
              <Button asChild variant="outline" className="shrink-0 rounded-full font-semibold">
                <Link href="/events">
                  Full calendar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {upcoming.map((event) => (
              <StaggerItem key={event.slug} className="h-full">
                <Link
                  href="/events"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={event.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      {event.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <time
                      dateTime={event.start}
                      className="text-xs font-semibold uppercase tracking-wider text-gradient-gold"
                    >
                      {formatShortDate(event.start)}
                    </time>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                      {event.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      {event.location}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------ give band */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-3xl border border-border/70 bg-ink px-6 py-16 text-center sm:px-12 lg:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
            />

            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold animate-float">
                <Sparkles className="h-6 w-6" />
              </span>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Every gift keeps the message going out
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Your giving funds the cameras, the streaming, the food parcels
                and the people who make Sunday happen here and far beyond our
                walls.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gold px-8 font-semibold text-ink hover:bg-gold/90"
                >
                  <Link href="/give">Give today</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/5 px-8 font-semibold text-white hover:bg-white/15 hover:text-white"
                >
                  <Link href="/about">See where it goes</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
