import type { Metadata } from "next";

import { StudioDashboard } from "@/components/studio/studio-dashboard";
import {
  fetchConnections,
  fetchContent,
  fetchEvents,
  fetchMessages,
} from "@/lib/appwrite-server";
import { seedMessages, seriesOf, speakersOf } from "@/lib/messages";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

// Admin data must always be fresh.
export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const [messages, events, content, connections] = await Promise.all([
    fetchMessages(),
    fetchEvents(),
    fetchContent(),
    fetchConnections(),
  ]);

  // Distinguish "real" DB records (which carry an id) from the seed fallback,
  // so the managers can label the state and disable edit/delete on seed rows.
  const messagesFromDb = messages.some((m) => m.id);
  const eventsFromDb = events.some((e) => e.id);

  return (
    <StudioDashboard
      messages={messages}
      events={events}
      content={content}
      connections={connections}
      speakerOptions={speakersOf([...messages, ...seedMessages])}
      seriesOptions={seriesOf([...messages, ...seedMessages])}
      messagesFromDb={messagesFromDb}
      eventsFromDb={eventsFromDb}
    />
  );
}
