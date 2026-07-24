"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import type { ContentSection } from "@/lib/content";
import type { ChurchEvent } from "@/lib/events";
import type { Message } from "@/lib/messages";
import {
  createEventRecord,
  createMessageRecord,
  deleteConnection,
  deleteEventRecord,
  deleteMessageRecord,
  saveContentSection,
  updateConnectionStatus,
  updateMessageRecord,
} from "@/lib/appwrite-server";

/**
 * Admin mutations, callable from the Studio's client components. Every one
 * re-checks the Clerk session server-side — the middleware guard is belt, this
 * is braces — and revalidates the public pages so edits appear immediately.
 */

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
}

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/messages");
  revalidatePath("/events");
  revalidatePath("/about");
  revalidatePath("/connect");
  revalidatePath("/give");
  revalidatePath("/studio");
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function publishMessageAction(
  message: Message,
): Promise<ActionResult> {
  try {
    await requireAuth();
    if (message.id) await updateMessageRecord(message.id, message);
    else await createMessageRecord(message);
    revalidateSite();
    revalidatePath(`/messages/${message.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteMessageAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    await deleteMessageRecord(id);
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function saveContentAction(
  section: ContentSection,
  value: unknown,
): Promise<ActionResult> {
  try {
    await requireAuth();
    await saveContentSection(section, value);
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function createEventAction(
  event: ChurchEvent,
): Promise<ActionResult> {
  try {
    await requireAuth();
    await createEventRecord(event);
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    await deleteEventRecord(id);
    revalidateSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function setConnectionStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await requireAuth();
    await updateConnectionStatus(id, status);
    revalidatePath("/studio");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteConnectionAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    await deleteConnection(id);
    revalidatePath("/studio");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
