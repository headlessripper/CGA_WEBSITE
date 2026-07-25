import "server-only";

import { cache } from "react";
import {
  Client,
  Databases,
  Users,
  Query,
  ID,
  type Models,
} from "node-appwrite";

import { appwrite, collections } from "@/lib/appwrite";
import {
  defaultContent,
  mergeContent,
  type ContentSection,
  type SiteContent,
} from "@/lib/content";
import {
  seedEvents,
  upcomingFrom,
  type ChurchEvent,
} from "@/lib/events";
import {
  featuredFrom,
  relatedFrom,
  seedMessages,
  sortMessages,
  type Message,
} from "@/lib/messages";

/**
 * Server-only Appwrite access (node-appwrite + secret API key).
 *
 * Every function degrades gracefully: if Appwrite isn't configured, or a call
 * fails, or a collection is empty, it returns the in-repo seed/default content.
 * That keeps the site fully working before the database is populated and during
 * the transition from template copy to the church's real content.
 */

const DB = appwrite.databaseId;

export function isServerConfigured() {
  return Boolean(
    process.env.APPWRITE_API_KEY && appwrite.endpoint && appwrite.projectId,
  );
}

function serverClient() {
  return new Client()
    .setEndpoint(appwrite.endpoint)
    .setProject(appwrite.projectId)
    .setKey(process.env.APPWRITE_API_KEY!);
}

function db() {
  return new Databases(serverClient());
}

/* ============================================================ messages ==== */

type Doc = Models.Document & Record<string, unknown>;

function docToMessage(d: Doc): Message {
  const videoSrc = (d.videoSrc as string) || "";
  const audioUrl = (d.audioUrl as string) || "";
  return {
    id: d.$id,
    slug: d.slug as string,
    title: d.title as string,
    speaker: (d.speaker as string) ?? "",
    series: (d.series as string) ?? "",
    date: (d.date as string) ?? "",
    scripture: (d.scripture as string) ?? "",
    summary: (d.summary as string) ?? "",
    thumbnail: (d.thumbnail as string) ?? "",
    durationSeconds: (d.durationSeconds as number) ?? 0,
    formats: ((d.formats as string[]) ?? []) as Message["formats"],
    video: videoSrc
      ? {
          src: videoSrc,
          downloadUrl: (d.videoDownloadUrl as string) || undefined,
          sizeBytes: (d.videoSizeBytes as number) || undefined,
        }
      : undefined,
    audio: audioUrl
      ? {
          url: audioUrl,
          downloadUrl: (d.audioDownloadUrl as string) || undefined,
          sizeBytes: (d.audioSizeBytes as number) || undefined,
        }
      : undefined,
    notes: (d.notes as string[]) ?? undefined,
    tags: (d.tags as string[]) ?? undefined,
    featured: Boolean(d.featured),
  };
}

/** Flattens a Message into the collection's attribute shape. */
export function messageToDoc(m: Message): Record<string, unknown> {
  return {
    slug: m.slug,
    title: m.title,
    speaker: m.speaker,
    series: m.series,
    date: m.date,
    scripture: m.scripture,
    summary: m.summary,
    thumbnail: m.thumbnail,
    durationSeconds: Math.round(m.durationSeconds) || 0,
    formats: m.formats,
    videoSrc: m.video?.src ?? "",
    videoDownloadUrl: m.video?.downloadUrl ?? "",
    videoSizeBytes: Math.round(m.video?.sizeBytes ?? 0),
    audioUrl: m.audio?.url ?? "",
    audioDownloadUrl: m.audio?.downloadUrl ?? "",
    audioSizeBytes: Math.round(m.audio?.sizeBytes ?? 0),
    notes: m.notes ?? [],
    tags: m.tags ?? [],
    featured: Boolean(m.featured),
  };
}

export const fetchMessages = cache(async (): Promise<Message[]> => {
  if (!isServerConfigured()) return sortMessages(seedMessages);
  try {
    const res = await db().listDocuments(DB, collections.messages, [
      Query.orderDesc("date"),
      Query.limit(200),
    ]);
    if (res.documents.length === 0) return sortMessages(seedMessages);
    return sortMessages(res.documents.map((d) => docToMessage(d as Doc)));
  } catch (err) {
    console.error("[appwrite] fetchMessages failed, using seed", err);
    return sortMessages(seedMessages);
  }
});

export async function fetchMessage(slug: string): Promise<Message | undefined> {
  const all = await fetchMessages();
  return all.find((m) => m.slug === slug);
}

export async function fetchFeaturedMessage(): Promise<Message | undefined> {
  return featuredFrom(await fetchMessages());
}

export async function fetchRelated(
  message: Message,
  limit = 3,
): Promise<Message[]> {
  return relatedFrom(await fetchMessages(), message, limit);
}

export async function createMessageRecord(m: Message) {
  return db().createDocument(
    DB,
    collections.messages,
    ID.unique(),
    messageToDoc(m),
  );
}

export async function updateMessageRecord(id: string, m: Message) {
  return db().updateDocument(DB, collections.messages, id, messageToDoc(m));
}

export async function deleteMessageRecord(id: string) {
  return db().deleteDocument(DB, collections.messages, id);
}

/**
 * Copies the in-repo seed library into the database, but only into collections
 * that are still empty so the team gets real, editable records to work from
 * instead of the read-only template fallback. Safe to call repeatedly.
 */
export async function importTemplate(): Promise<{
  messages: number;
  events: number;
}> {
  const database = db();
  let messagesAdded = 0;
  let eventsAdded = 0;

  const existingMessages = await database.listDocuments(DB, collections.messages, [
    Query.limit(1),
  ]);
  if (existingMessages.total === 0) {
    for (const [i, m] of seedMessages.entries()) {
      await database.createDocument(DB, collections.messages, ID.unique(), {
        ...messageToDoc(m),
        order: i,
      });
      messagesAdded++;
    }
  }

  const existingEvents = await database.listDocuments(DB, collections.events, [
    Query.limit(1),
  ]);
  if (existingEvents.total === 0) {
    for (const e of seedEvents) {
      await database.createDocument(
        DB,
        collections.events,
        ID.unique(),
        eventToDoc(e),
      );
      eventsAdded++;
    }
  }

  return { messages: messagesAdded, events: eventsAdded };
}

/* ============================================================== events ==== */

function docToEvent(d: Doc): ChurchEvent {
  return {
    id: d.$id,
    slug: d.slug as string,
    title: d.title as string,
    start: (d.start as string) ?? "",
    end: (d.end as string) || undefined,
    location: (d.location as string) ?? "",
    category: ((d.category as string) ?? "Gathering") as ChurchEvent["category"],
    description: (d.description as string) ?? "",
    image: (d.image as string) ?? "",
    registrationUrl: (d.registrationUrl as string) || undefined,
  };
}

export function eventToDoc(e: ChurchEvent): Record<string, unknown> {
  return {
    slug: e.slug,
    title: e.title,
    start: e.start,
    end: e.end ?? "",
    location: e.location,
    category: e.category,
    description: e.description,
    image: e.image,
    registrationUrl: e.registrationUrl ?? "",
  };
}

export const fetchEvents = cache(async (): Promise<ChurchEvent[]> => {
  if (!isServerConfigured()) return seedEvents;
  try {
    const res = await db().listDocuments(DB, collections.events, [
      Query.orderAsc("start"),
      Query.limit(200),
    ]);
    if (res.documents.length === 0) return seedEvents;
    return res.documents.map((d) => docToEvent(d as Doc));
  } catch (err) {
    console.error("[appwrite] fetchEvents failed, using seed", err);
    return seedEvents;
  }
});

export async function fetchUpcomingEvents(): Promise<ChurchEvent[]> {
  return upcomingFrom(await fetchEvents());
}

export async function createEventRecord(e: ChurchEvent) {
  return db().createDocument(DB, collections.events, ID.unique(), eventToDoc(e));
}

export async function deleteEventRecord(id: string) {
  return db().deleteDocument(DB, collections.events, id);
}

/* ============================================================= content ==== */

export const fetchContent = cache(async (): Promise<SiteContent> => {
  if (!isServerConfigured()) return defaultContent;
  try {
    const res = await db().listDocuments(DB, collections.content, [
      Query.limit(100),
    ]);
    const partial: Partial<Record<ContentSection, unknown>> = {};
    for (const doc of res.documents) {
      const key = (doc as Doc).key as ContentSection;
      const raw = (doc as Doc).value as string;
      try {
        partial[key] = JSON.parse(raw);
      } catch {
        // Skip a malformed section rather than break the whole page.
      }
    }
    return mergeContent(partial);
  } catch (err) {
    console.error("[appwrite] fetchContent failed, using defaults", err);
    return defaultContent;
  }
});

export async function saveContentSection(
  section: ContentSection,
  value: unknown,
) {
  const database = db();
  const serialized = JSON.stringify(value);
  const existing = await database.listDocuments(DB, collections.content, [
    Query.equal("key", section),
    Query.limit(1),
  ]);
  if (existing.documents.length > 0) {
    return database.updateDocument(
      DB,
      collections.content,
      existing.documents[0].$id,
      { value: serialized },
    );
  }
  return database.createDocument(DB, collections.content, ID.unique(), {
    key: section,
    value: serialized,
  });
}

/* ========================================================= connections ==== */

export interface ConnectionInput {
  name: string;
  email: string;
  phone?: string;
  reason: string;
  message: string;
}

export interface ConnectionRecord extends ConnectionInput {
  id: string;
  status: string;
  createdAt: string;
}

export async function createConnection(input: ConnectionInput) {
  return db().createDocument(DB, collections.connections, ID.unique(), {
    name: input.name,
    email: input.email,
    phone: input.phone ?? "",
    reason: input.reason,
    message: input.message,
    status: "new",
    createdAt: new Date().toISOString(),
  });
}

export async function fetchConnections(): Promise<ConnectionRecord[]> {
  if (!isServerConfigured()) return [];
  try {
    const res = await db().listDocuments(DB, collections.connections, [
      Query.orderDesc("createdAt"),
      Query.limit(200),
    ]);
    return res.documents.map((d) => {
      const doc = d as Doc;
      return {
        id: doc.$id,
        name: doc.name as string,
        email: doc.email as string,
        phone: (doc.phone as string) || undefined,
        reason: doc.reason as string,
        message: doc.message as string,
        status: (doc.status as string) ?? "new",
        createdAt: (doc.createdAt as string) ?? doc.$createdAt,
      };
    });
  } catch (err) {
    console.error("[appwrite] fetchConnections failed", err);
    return [];
  }
}

export async function updateConnectionStatus(id: string, status: string) {
  return db().updateDocument(DB, collections.connections, id, { status });
}

export async function deleteConnection(id: string) {
  return db().deleteDocument(DB, collections.connections, id);
}

/* =========================================================== upload auth == */

/**
 * Mints a one-time Appwrite token for the dedicated uploader account, which the
 * browser exchanges for a session to upload straight to Appwrite (bypassing
 * Vercel's request-body limit). Only ever called from the Clerk-gated route.
 */
export async function createUploaderToken() {
  const uploaderId = process.env.APPWRITE_UPLOADER_USER_ID || "studio-uploader";
  const users = new Users(serverClient());
  // 15-minute token; the client exchanges it for a session immediately.
  const token = await users.createToken(uploaderId, 64, 900);
  return { userId: uploaderId, secret: token.secret };
}
