import type { Metadata } from "next";

import { MessageLibrary } from "@/components/site/message-library";
import { PageHeader } from "@/components/site/page-header";
import { fetchMessages } from "@/lib/appwrite-server";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Watch or listen to every message from Centre of Grace Assembly. Search by title, speaker, series or scripture.",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await fetchMessages();

  return (
    <>
      <PageHeader
        eyebrow="Watch & listen"
        title="Every message, whenever you need it"
        description="Video streams adapt to your connection, and every message has an audio-only version for when data is tight. Nothing is behind a login."
      />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <MessageLibrary messages={messages} />
      </section>
    </>
  );
}
