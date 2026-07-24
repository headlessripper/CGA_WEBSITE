import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Clock, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCard } from "@/components/site/message-card";
import { MessagePlayer } from "@/components/site/message-player";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { fetchMessage, fetchRelated } from "@/lib/appwrite-server";
import { formatDate, formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const message = await fetchMessage(slug);
  if (!message) return { title: "Message not found" };

  return {
    title: message.title,
    description: message.summary,
    openGraph: {
      title: message.title,
      description: message.summary,
      images: [{ url: message.thumbnail }],
      type: "video.other",
    },
  };
}

export default async function MessagePage({ params }: PageProps) {
  const { slug } = await params;
  const message = await fetchMessage(slug);
  if (!message) notFound();

  const related = await fetchRelated(message);

  const meta = [
    { Icon: User, label: message.speaker },
    { Icon: Calendar, label: formatDate(message.date) },
    { Icon: Clock, label: formatDuration(message.durationSeconds) },
    { Icon: BookOpen, label: message.scripture },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-[7.5rem] lg:px-8 lg:pt-32">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All messages
        </Link>
      </div>

      <article className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <Reveal direction="none">
              <MessagePlayer message={message} />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10">
                <Badge className="mb-4 border-none bg-gold/15 text-gold hover:bg-gold/15">
                  {message.series}
                </Badge>

                <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                  {message.title}
                </h1>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  {meta.map(({ Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gold" />
                      {label}
                    </span>
                  ))}
                </div>

                <Separator className="my-8" />

                <p className="text-lg leading-relaxed text-muted-foreground">
                  {message.summary}
                </p>

                {message.notes && message.notes.length > 0 && (
                  <div className="mt-10 rounded-2xl border border-border/70 bg-card/50 p-6 sm:p-8">
                    <h2 className="font-display text-xl font-semibold">
                      Message notes
                    </h2>
                    <ul className="mt-5 space-y-4">
                      {message.notes.map((note, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-xs font-semibold text-gold">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.tags && message.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {message.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* ------------------------------------------------ sidebar */}
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:h-fit">
            <Reveal direction="left" delay={0.15}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-gold">
                Keep listening
              </h2>
              <div className="mt-5 space-y-4">
                {related.map((m) => (
                  <MessageCard key={m.slug} message={m} />
                ))}
              </div>
            </Reveal>
          </aside>
        </div>
      </article>

      <section className="border-t border-border/60 bg-card/30 py-16 lg:hidden">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-2xl font-semibold">More messages</h2>
          <Stagger className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((m) => (
              <StaggerItem key={m.slug} className="h-full">
                <MessageCard message={m} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
