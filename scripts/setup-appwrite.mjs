/**
 * One-time Appwrite provisioning for Centre of Grace Assembly.
 *
 * Creates the database, collections, attributes and indexes the site reads
 * from, a dedicated "studio uploader" account for direct uploads, and applies
 * the bucket permissions (public read + create locked to the uploader).
 *
 * Idempotent: safe to re-run. Reads credentials from .env.local.
 *
 *   node scripts/setup-appwrite.mjs
 */

import { readFileSync } from "node:fs";
import {
  Client,
  Databases,
  Storage,
  Users,
  Permission,
  Role,
  DatabasesIndexType as IndexType,
} from "node-appwrite";

/* ----------------------------------------------------- read .env.local ---- */
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const endpoint = env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const bucketId = env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
const apiKey = env.APPWRITE_API_KEY;
const uploaderId = env.APPWRITE_UPLOADER_USER_ID || "studio-uploader";

if (!endpoint || !project || !apiKey) {
  console.error("Missing Appwrite env vars in .env.local.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(apiKey);
const databases = new Databases(client);
const storage = new Storage(client);
const users = new Users(client);

const DB = "main";

/* --------------------------------------------------------- tiny helpers ---- */
const ok = (label) => console.log(`  ✓ ${label}`);
async function ensure(label, fn) {
  try {
    await fn();
    ok(label);
  } catch (err) {
    if (err?.code === 409) console.log(`  • ${label} (exists)`);
    else if (String(err?.message ?? "").includes("already exists"))
      console.log(`  • ${label} (exists)`);
    else console.error(`  ✗ ${label}: ${err?.message ?? err}`);
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* string, integer, boolean attribute + index helpers -------------------- */
const str = (c, key, size, req = false, arr = false) =>
  ensure(`${c}.${key}`, () =>
    databases.createStringAttribute(DB, c, key, size, req, undefined, arr),
  );
const int = (c, key, req = false, max = 2_000_000_000_000) =>
  ensure(`${c}.${key}`, () =>
    databases.createIntegerAttribute(DB, c, key, req, 0, max),
  );
const bool = (c, key) =>
  ensure(`${c}.${key}`, () =>
    databases.createBooleanAttribute(DB, c, key, false),
  );

async function run() {
  console.log("Database");
  await ensure("database main", () => databases.create(DB, "CGA"));

  const publicRead = [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];
  const privateOnly = [Permission.create(Role.any())]; // API key still bypasses

  console.log("Collections");
  await ensure("messages", () =>
    databases.createCollection(DB, "messages", "Messages", publicRead, false),
  );
  await ensure("events", () =>
    databases.createCollection(DB, "events", "Events", publicRead, false),
  );
  await ensure("content", () =>
    databases.createCollection(DB, "content", "Content", publicRead, false),
  );
  await ensure("connections", () =>
    databases.createCollection(DB, "connections", "Connections", privateOnly, false),
  );

  await sleep(1500);

  console.log("Attributes: messages");
  await str("messages", "slug", 120, true);
  await str("messages", "title", 300, true);
  await str("messages", "speaker", 200);
  await str("messages", "series", 200);
  await str("messages", "date", 40);
  await str("messages", "scripture", 200);
  await str("messages", "summary", 3000);
  await str("messages", "thumbnail", 1200);
  await int("messages", "durationSeconds");
  await str("messages", "formats", 20, false, true);
  await str("messages", "videoSrc", 1500);
  await str("messages", "videoDownloadUrl", 1500);
  await int("messages", "videoSizeBytes");
  await str("messages", "audioUrl", 1500);
  await str("messages", "audioDownloadUrl", 1500);
  await int("messages", "audioSizeBytes");
  await str("messages", "notes", 2000, false, true);
  await str("messages", "tags", 60, false, true);
  await bool("messages", "featured");
  await int("messages", "order");

  console.log("Attributes: events");
  await str("events", "slug", 120, true);
  await str("events", "title", 300, true);
  await str("events", "start", 40);
  await str("events", "end", 40);
  await str("events", "location", 200);
  await str("events", "category", 60);
  await str("events", "description", 3000);
  await str("events", "image", 1200);
  await str("events", "registrationUrl", 600);

  console.log("Attributes: content");
  await str("content", "key", 120, true);
  await str("content", "value", 1_000_000);

  console.log("Attributes: connections");
  await str("connections", "name", 200, true);
  await str("connections", "email", 320, true);
  await str("connections", "phone", 60);
  await str("connections", "reason", 60);
  await str("connections", "message", 5000);
  await str("connections", "status", 40);
  await str("connections", "createdAt", 40);

  await sleep(2000);

  console.log("Indexes");
  await ensure("messages.slug unique", () =>
    databases.createIndex(DB, "messages", "slug_unique", IndexType.Unique, ["slug"]),
  );
  await ensure("messages.date index", () =>
    databases.createIndex(DB, "messages", "date_idx", IndexType.Key, ["date"], ["DESC"]),
  );
  await ensure("events.slug unique", () =>
    databases.createIndex(DB, "events", "slug_unique", IndexType.Unique, ["slug"]),
  );
  await ensure("content.key unique", () =>
    databases.createIndex(DB, "content", "key_unique", IndexType.Unique, ["key"]),
  );
  await ensure("connections.createdAt index", () =>
    databases.createIndex(DB, "connections", "created_idx", IndexType.Key, ["createdAt"], ["DESC"]),
  );

  console.log("Studio uploader account");
  await ensure(`user ${uploaderId}`, () =>
    users.create(uploaderId, undefined, undefined, undefined, "Studio Uploader"),
  );

  console.log("Bucket permissions");
  if (bucketId) {
    await ensure("bucket read=any, create=uploader", () =>
      storage.updateBucket(
        bucketId,
        "Sermon media",
        [
          Permission.read(Role.any()),
          Permission.create(Role.user(uploaderId)),
          Permission.update(Role.user(uploaderId)),
          Permission.delete(Role.user(uploaderId)),
        ],
        undefined, // fileSecurity
        true, // enabled
        undefined, // maximumFileSize — leave as configured in console
        undefined,
        undefined,
        undefined,
        false, // encryption off (large media)
        false, // antivirus off (large media)
      ),
    );
  } else {
    console.log("  • no bucket id set — skipping");
  }

  console.log("\nDone.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
