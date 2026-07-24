"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { motion } from "motion/react";
import {
  CalendarDays,
  Inbox,
  LayoutList,
  Palette,
  UploadCloud,
} from "lucide-react";

import { Logo } from "@/components/site/logo";
import { StudioWorkflow } from "@/components/site/studio-workflow";
import { ContentEditor } from "@/components/studio/content-editor";
import { ConnectionsInbox } from "@/components/studio/connections-inbox";
import { EventsManager } from "@/components/studio/events-manager";
import { MessagesManager } from "@/components/studio/messages-manager";
import type { ConnectionRecord } from "@/lib/appwrite-server";
import type { SiteContent } from "@/lib/content";
import type { ChurchEvent } from "@/lib/events";
import type { Message } from "@/lib/messages";
import { cn } from "@/lib/utils";

type TabId = "publish" | "messages" | "content" | "events" | "connections";

export function StudioDashboard({
  messages,
  events,
  content,
  connections,
  speakerOptions,
  seriesOptions,
  messagesFromDb,
  eventsFromDb,
}: {
  messages: Message[];
  events: ChurchEvent[];
  content: SiteContent;
  connections: ConnectionRecord[];
  speakerOptions: string[];
  seriesOptions: string[];
  messagesFromDb: boolean;
  eventsFromDb: boolean;
}) {
  const [tab, setTab] = useState<TabId>("publish");
  const newConnections = connections.filter((c) => c.status !== "handled").length;

  const tabs: { id: TabId; label: string; Icon: typeof UploadCloud; badge?: number }[] = [
    { id: "publish", label: "Publish", Icon: UploadCloud },
    { id: "messages", label: "Messages", Icon: LayoutList },
    { id: "content", label: "Content", Icon: Palette },
    { id: "events", label: "Events", Icon: CalendarDays },
    { id: "connections", label: "Connections", Icon: Inbox, badge: newConnections },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo showWordmark={false} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gradient-gold">
                Media Studio
              </p>
              <p className="text-sm font-medium">Centre of Grace Assembly</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              View site ↗
            </Link>
            <UserButton
              appearance={{ variables: { colorPrimary: "#c8962e" } }}
            />
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 lg:px-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
              {t.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-semibold text-ink">
                  {t.badge}
                </span>
              ) : null}
              {tab === t.id && (
                <motion.span
                  layoutId="studio-tab"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold"
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {tab === "publish" && (
          <Section
            title="Publish a message"
            description="Upload the recording (and an optional MP3), add the details, and publish — it goes live across the site immediately."
          >
            <StudioWorkflow
              speakerOptions={speakerOptions}
              seriesOptions={seriesOptions}
            />
          </Section>
        )}

        {tab === "messages" && (
          <Section title="Message library" description="Edit or remove published messages.">
            <MessagesManager
              messages={messages}
              fromDatabase={messagesFromDb}
              speakerOptions={speakerOptions}
              seriesOptions={seriesOptions}
            />
          </Section>
        )}

        {tab === "content" && (
          <Section
            title="Site content"
            description="Replace the template copy with the church's own — changes save to the database and appear on the site right away."
          >
            <ContentEditor content={content} />
          </Section>
        )}

        {tab === "events" && (
          <Section title="Events" description="Add or remove what's coming up.">
            <EventsManager events={events} fromDatabase={eventsFromDb} />
          </Section>
        )}

        {tab === "connections" && (
          <Section
            title="Connections"
            description="People who reached out through the Connect page."
          >
            <ConnectionsInbox connections={connections} />
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </motion.div>
  );
}
