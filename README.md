# Centre of Grace Assembly

A database-driven church website built to **publish video and audio messages** —
including full-service recordings in the **5–10 GB** range — and to let the team
run the whole site (messages, events, page copy, connect enquiries) from a
guarded **Studio**, with no code edits.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Framer Motion · **Appwrite** (Storage + Databases) · **Clerk** (admin auth). The
hero uses the `@paper-design/shaders-react` liquid-metal shader.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in Appwrite + Clerk values
npm run setup:appwrite         # provisions the database, collections and bucket
npm run dev
```

Open <http://localhost:3000>. The Studio is at **/studio** (sign in via Clerk).

```bash
npm run build   # production build (type-checked)
```

The site runs even before Appwrite/Clerk are configured: pages fall back to the
in-repo seed content, so nothing is broken on a fresh clone.

---

## How 5–10 GB messages are handled (and why it works on Vercel)

A multi-gigabyte recording is **never bundled with, or routed through, the Next
app**. It goes straight from the browser to **Appwrite Storage**; the app only
authorises the upload. This is what makes it Vercel-safe — a 5 MB chunk would
exceed Vercel's ~4.5 MB serverless body limit, so nothing large touches a
function.

```
Studio (Clerk)                     Appwrite
   │  1. POST /api/appwrite/session (Clerk-gated) → one-time uploader token
   │  2. exchange token → Appwrite session → short-lived JWT
   ▼
Browser ── 5 MB chunks, JWT-authorised, resumable ──▶ Appwrite Storage bucket
                                                          │  public read
   Viewer ◀── progressive stream (HTTP range requests) ──┘
```

- **Chunked, resumable, pausable** upload — `lib/appwrite-upload.ts`. A dropped
  connection retries a single chunk; the JWT auto-refreshes for multi-hour
  uploads.
- **Progressive playback** — Appwrite honours range requests, so the player
  (`components/site/video-player.tsx`) streams and seeks without downloading the
  whole file. It also still accepts an HLS `.m3u8` URL if you ever add a
  transcoding provider.
- **Audio-only** version (a separate MP3, also in Appwrite) plays from a
  persistent site-wide dock — the low-data path.

> Appwrite is object storage, not a transcoder — there's no adaptive-bitrate
> ladder. On Appwrite **Cloud** the max file size is capped (single-digit GB);
> to store the 10 GB end of the range, **self-host Appwrite** and raise
> `_APP_STORAGE_LIMIT`.

---

## The Studio (guarded by Clerk)

`/studio` and the admin APIs are protected by Clerk (`middleware.ts`). Add team
members in the Clerk dashboard. Tabs:

- **Publish** — upload the recording (+ optional MP3), fill in the details,
  publish. The record is written straight to the database and goes live
  everywhere at once.
- **Messages** — edit or delete published messages.
- **Content** — replace template copy with the church's own: church details,
  home hero, service times (which drive the live countdown), and the connect
  plan. Saves to the database; the site updates immediately.
- **Events** — add or remove what's coming up.
- **Connections** — the inbox of everyone who reached out via the Connect page;
  mark handled or delete.

---

## Data model (Appwrite Databases)

`npm run setup:appwrite` (idempotent) creates database `main` with:

| Collection    | Holds                                   | Read     |
| ------------- | --------------------------------------- | -------- |
| `messages`    | the sermon library                      | public   |
| `events`      | upcoming events                         | public   |
| `content`     | editable site copy (one doc per section) | public   |
| `connections` | Connect-page enquiries (PII)            | private  |

It also creates the dedicated **uploader** account and sets the bucket
permissions (public read, create locked to that account).

Everything is read server-side through `lib/appwrite-server.ts`, which **falls
back to the in-repo seed** (`lib/messages.ts`, `lib/events.ts`, `lib/content.ts`)
whenever a collection is empty or Appwrite is unreachable. So the template
content shows until the team replaces it from the Studio.

---

## Deploying to Vercel

1. Push the repo and import it in Vercel.
2. Add every variable from `.env.example` to the Vercel project (Production +
   Preview). `NEXT_PUBLIC_*` are exposed to the browser; the rest stay server-side.
3. In the **Appwrite console → Project → Platforms**, add a **Web platform** for
   your Vercel domain (and `localhost` for dev). This is required — browsers
   upload directly to Appwrite, so the domain must be allow-listed for CORS.
4. In Clerk, add your production domain and configure the sign-in URL
   (`/studio/sign-in`).

Uploads work on Vercel because they go browser → Appwrite directly; only the
tiny session-token request touches a function.

---

## Project structure

```
app/
  layout.tsx              Root: providers + fonts (no site chrome)
  (site)/                 Public site — its layout adds the nav + footer
    layout.tsx
    page.tsx              Home
    about|events|connect|give|messages/
  studio/                 Admin (Clerk-gated) — no public chrome
    page.tsx              Dashboard (fetches all data)
    actions.ts            Server actions (auth-checked mutations)
    sign-in/
  api/
    connect/              Public: saves a Connect enquiry
    appwrite/session/     Clerk-gated: mints an upload session token
components/
  ui/                     shadcn primitives + liquid-metal-hero.tsx
  site/                   Public components (players, cards, nav, uploader…)
  studio/                 Admin components (dashboard, editors, managers)
lib/
  appwrite.ts             Public config + file-URL helpers
  appwrite-server.ts      Server-only data layer (node-appwrite + API key)
  appwrite-upload.ts      Direct, resumable browser→Appwrite uploader
  messages.ts / events.ts Types + seed fallback + pure helpers
  content.ts              Editable-content shape + defaults + merge
scripts/setup-appwrite.mjs  One-time provisioning
middleware.ts             Clerk route protection
```

---

## Notes

- **Everything on the public pages is editable from Studio → Content**, including
  the whole About page (story, values, leadership, beliefs, FAQs).
- **Managing the template:** a fresh database shows the read-only seed. In
  Studio → Messages / Events, click **"Import the template"** to copy it into the
  database as real records you can edit, reorder and delete. (Editing a single
  seed item without importing would drop the rest, since the fallback is
  all-or-nothing — hence the explicit import.)
- Stock imagery is from Unsplash; swap for real church photography.
- Search the repo for `PLACEHOLDER` for the last few hard-coded values
  (mobile-money / bank details on the Give page).
