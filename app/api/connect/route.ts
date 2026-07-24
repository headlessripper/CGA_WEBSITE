import { NextResponse } from "next/server";

import { createConnection } from "@/lib/appwrite-server";

/**
 * Receives Connect-page submissions.
 *
 * Right now this validates the payload and logs it. Before launch, replace the
 * `TODO` block with a real destination — Resend / SendGrid for email, or an
 * insert into whatever the office already uses. Keep the validation.
 */

const REASONS = [
  "first-visit",
  "prayer",
  "serve",
  "small-group",
  "baptism",
  "other",
] as const;

type Reason = (typeof REASONS)[number];

interface Payload {
  name: string;
  email: string;
  phone?: string;
  reason: Reason;
  message: string;
}

function validate(body: unknown): { ok: true; data: Payload } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  const reason = b.reason as Reason;

  if (name.length < 2) return { ok: false, error: "Please tell us your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." };
  }
  if (!REASONS.includes(reason)) {
    return { ok: false, error: "Please choose what this is about." };
  }
  if (message.length < 5) {
    return { ok: false, error: "Please add a little more detail." };
  }
  if (message.length > 4000) {
    return { ok: false, error: "That message is too long." };
  }

  return { ok: true, data: { name, email, phone, reason, message } };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Saved to the private `connections` collection — the pastoral team reads and
  // clears these from the Studio's Connections inbox.
  try {
    await createConnection(result.data);
  } catch (err) {
    console.error("[connect] could not save submission", err);
    return NextResponse.json(
      { error: "We couldn't save your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
