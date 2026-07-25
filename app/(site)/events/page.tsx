import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { fetchContent, fetchUpcomingEvents } from "@/lib/appwrite-server";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Everything happening at Centre of Grace Assembly, gatherings, outreach, training and special nights.",
};

export const dynamic = "force-dynamic";

function timeRange(start: string, end?: string) {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const from = new Date(start).toLocaleTimeString("en-GB", opts);
  if (!end) return from;
  const to = new Date(end).toLocaleTimeString("en-GB", opts);
  return `${from} – ${to}`;
}

export default async function EventsPage() {
  const [upcoming, content] = await Promise.all([
    fetchUpcomingEvents(),
    fetchContent(),
  ]);
  const serviceTimes = content.serviceTimes;

  return (
    <>
      <PageHeader
        eyebrow="What's on"
        title="More than Sundays"
        description="Some of the best moments of church life happen between services. Everything here is open bring a friend, or come on your own and leave with a few."
      />

      {/* --------------------------------------------------- weekly rhythm */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold">Weekly rhythm</h2>
          <p className="mt-2 text-muted-foreground">
            These happen every week no registration, no sign-up.
          </p>
        </Reveal>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceTimes.map((service) => (
            <StaggerItem key={`${service.day}-${service.time}`} className="h-full">
              <div className="h-full rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-gold/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-gold">
                  {service.day}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  {service.time}
                </p>
                <p className="mt-3 font-medium">{service.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {service.detail}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* -------------------------------------------------------- calendar */}
      <section className="border-t border-border/60 bg-card/30 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold">
              Coming up next
            </h2>
          </Reveal>

          <div className="mt-10 space-y-6">
            {upcoming.map((event, i) => {
              const date = new Date(event.start);
              return (
                <Reveal key={event.slug} delay={Math.min(i * 0.06, 0.3)}>
                  <article className="group grid gap-6 overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:border-gold/40 hover:shadow-xl md:grid-cols-[9rem_16rem_1fr] md:items-center">
                    {/* Date block */}
                    <div className="flex flex-row items-center gap-4 px-6 pt-6 md:flex-col md:gap-0 md:py-8 md:pl-8 md:pr-0">
                      <span className="font-display text-5xl font-semibold leading-none text-gradient-gold">
                        {date.getDate()}
                      </span>
                      <span className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground md:mt-2">
                        {date.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                    </div>

                    <div className="relative order-first h-44 md:order-none md:h-40 md:rounded-xl">
                      <Image
                        src={event.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 16rem"
                        className="object-cover md:rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent md:rounded-xl" />
                      <Badge className="absolute left-3 top-3 border-none bg-ink/70 text-white backdrop-blur-sm hover:bg-ink/70">
                        {event.category}
                      </Badge>
                    </div>

                    <div className="px-6 pb-6 md:py-8 md:pl-2 md:pr-8">
                      <h3 className="font-display text-xl font-semibold leading-snug">
                        {event.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-gold" />
                          {date.toLocaleDateString("en-GB", {
                            weekday: "long",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gold" />
                          {timeRange(event.start, event.end)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-gold" />
                          {event.location}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                      {event.registrationUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-5 rounded-full font-semibold"
                        >
                          <Link href={event.registrationUrl}>
                            Let us know you&apos;re coming
                            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
