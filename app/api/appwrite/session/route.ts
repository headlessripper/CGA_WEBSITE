import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createUploaderToken } from "@/lib/appwrite-server";

/**
 * Mints a one-time Appwrite token for the uploader account.
 *
 * Clerk-gated (see middleware.ts). The browser exchanges the returned secret
 * for an Appwrite session and uploads the file **directly** to Appwrite — so a
 * 10 GB recording never passes through Vercel's serverless request limit.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: "Appwrite is not configured on the server." },
      { status: 501 },
    );
  }

  try {
    const token = await createUploaderToken();
    return NextResponse.json(token);
  } catch (err) {
    console.error("[appwrite] createUploaderToken failed", err);
    return NextResponse.json(
      { error: "Could not start an upload session." },
      { status: 502 },
    );
  }
}
