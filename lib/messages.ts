/**
 * Message library.
 *
 * IMPORTANT — how large media is handled here.
 *
 * A 5–10 GB service recording is never bundled with or served by this app. It
 * is uploaded (from /studio) to an **Appwrite Storage** bucket, and each message
 * points at that file's public view URL (`video.src`). Appwrite honours HTTP
 * range requests, so the browser streams and seeks through a multi-gigabyte
 * recording without downloading it whole — progressive streaming, straight from
 * the bucket.
 *
 * Note that Appwrite is object storage, not a transcoder: there is no adaptive
 * bitrate ladder. The low-data path is the separate, compressed audio-only file
 * (`audio.url`) — also stored in Appwrite — surfaced everywhere as "Listen".
 *
 * `sizeBytes` is the size of the original file, shown on the download link so
 * people know what they are committing to before tapping it on mobile data.
 *
 * The demo entries below point at public test media so the site is fully
 * browsable before Appwrite is connected. The player also still accepts an HLS
 * (`.m3u8`) URL in `src`, in case a message is ever served from a transcoding
 * provider. Replace these via /studio — see README.md → "Publishing a message".
 */

export type MessageFormat = "video" | "audio";

export interface Message {
  /** Appwrite document id, present on records read from the database. */
  id?: string;
  slug: string;
  title: string;
  speaker: string;
  series: string;
  /** ISO date of the service. */
  date: string;
  scripture: string;
  summary: string;
  thumbnail: string;
  durationSeconds: number;
  formats: MessageFormat[];
  video?: {
    /** Appwrite file view URL (or an HLS .m3u8 manifest) — the player streams this. */
    src: string;
    /** Optional force-download URL for the original file. */
    downloadUrl?: string;
    /** Size of the original recording, in bytes. */
    sizeBytes?: number;
  };
  audio?: {
    url: string;
    downloadUrl?: string;
    sizeBytes?: number;
  };
  /** Bullet outline shown under the player. */
  notes?: string[];
  tags?: string[];
  featured?: boolean;
}

const GB = 1024 ** 3;
const MB = 1024 ** 2;

export const messages: Message[] = [
  {
    slug: "grace-that-goes-first",
    title: "The Grace That Goes First",
    speaker: "Pastor Samuel Adjei",
    series: "Rooted in Grace",
    date: "2026-07-19",
    scripture: "Ephesians 2:1–10",
    summary:
      "Before you took a single step toward God, grace had already crossed the room. Part one of our summer series on the foundations of the gospel.",
    thumbnail:
      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2735,
    formats: ["video", "audio"],
    video: {
      src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      downloadUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      sizeBytes: 8.4 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      sizeBytes: 62 * MB,
    },
    notes: [
      "Grace is not God's response to our movement — it is what makes movement possible.",
      "Dead people cannot cooperate (v.1). That is the whole point of verse 4.",
      "\"But God\" is the hinge the entire chapter turns on.",
      "Saved by grace, through faith, for good works — never by them.",
    ],
    tags: ["grace", "gospel", "foundations"],
    featured: true,
  },
  {
    slug: "when-the-waiting-is-the-work",
    title: "When the Waiting Is the Work",
    speaker: "Pastor Naa Adjeley Mensah",
    series: "Rooted in Grace",
    date: "2026-07-12",
    scripture: "Psalm 27:13–14",
    summary:
      "Waiting is not the pause between the seasons of your life. Often it is the season — and God is doing more in it than you can see.",
    thumbnail:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2410,
    formats: ["video", "audio"],
    video: {
      src: "https://test-streams.mux.dev/tos_ismc/main.m3u8",
      sizeBytes: 6.1 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      sizeBytes: 55 * MB,
    },
    notes: [
      "David says \"I would have despaired\" — the honesty comes before the hope.",
      "Waiting on the Lord is active: it is strength, courage and expectation.",
      "The land of the living is here, not later.",
    ],
    tags: ["hope", "patience", "psalms"],
  },
  {
    slug: "a-house-of-welcome",
    title: "A House of Welcome",
    speaker: "Pastor Samuel Adjei",
    series: "Rooted in Grace",
    date: "2026-07-05",
    scripture: "Romans 15:7",
    summary:
      "Christ welcomed us before we were presentable. A church that forgets that becomes a club; a church that remembers it becomes a home.",
    thumbnail:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2580,
    formats: ["video", "audio"],
    video: {
      src:
        "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsd9wE.m3u8",
      sizeBytes: 9.2 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      sizeBytes: 58 * MB,
    },
    tags: ["community", "hospitality"],
  },
  {
    slug: "the-quiet-discipline-of-prayer",
    title: "The Quiet Discipline of Prayer",
    speaker: "Pastor Naa Adjeley Mensah",
    series: "Midweek Encounter",
    date: "2026-07-01",
    scripture: "Luke 11:1–13",
    summary:
      "The disciples watched Jesus do many things. Only one of them made them say: teach us to do that. Audio from Wednesday's midweek teaching.",
    thumbnail:
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 1985,
    formats: ["audio"],
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      sizeBytes: 47 * MB,
    },
    notes: [
      "Ask, seek, knock — three verbs, one posture.",
      "The Father's gift at the end of the passage is the Spirit, not the thing.",
    ],
    tags: ["prayer", "midweek"],
  },
  {
    slug: "carrying-what-you-cannot-fix",
    title: "Carrying What You Cannot Fix",
    speaker: "Esi Boateng",
    series: "Honest Faith",
    date: "2026-06-28",
    scripture: "2 Corinthians 12:7–10",
    summary:
      "Some things do not get resolved. Paul asked three times and got an answer he did not want — and called it grace anyway.",
    thumbnail:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2210,
    formats: ["video", "audio"],
    video: {
      src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      sizeBytes: 5.4 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      sizeBytes: 51 * MB,
    },
    tags: ["suffering", "grace", "youth"],
    featured: true,
  },
  {
    slug: "songs-in-the-night",
    title: "Songs in the Night",
    speaker: "Kwame Osei",
    series: "Night of Grace",
    date: "2026-06-21",
    scripture: "Acts 16:25–34",
    summary:
      "Midnight, a prison cell, and two men singing. Recorded live at June's Night of Grace — includes forty minutes of unbroken worship.",
    thumbnail:
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 4620,
    formats: ["video", "audio"],
    video: {
      src: "https://test-streams.mux.dev/tos_ismc/main.m3u8",
      sizeBytes: 10.8 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      sizeBytes: 104 * MB,
    },
    tags: ["worship", "night of grace"],
  },
  {
    slug: "the-long-obedience",
    title: "The Long Obedience",
    speaker: "Pastor Samuel Adjei",
    series: "Honest Faith",
    date: "2026-06-14",
    scripture: "Hebrews 12:1–3",
    summary:
      "Endurance is unglamorous and almost entirely made of ordinary Tuesdays. Here is how to run a race you cannot sprint.",
    thumbnail:
      "https://images.unsplash.com/photo-1490127252417-7c393f993ee4?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2495,
    formats: ["video", "audio"],
    video: {
      src:
        "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsd9wE.m3u8",
      sizeBytes: 7.3 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      sizeBytes: 59 * MB,
    },
    tags: ["endurance", "discipleship"],
  },
  {
    slug: "what-generosity-does-to-you",
    title: "What Generosity Does to You",
    speaker: "Pastor Naa Adjeley Mensah",
    series: "Honest Faith",
    date: "2026-06-07",
    scripture: "2 Corinthians 9:6–15",
    summary:
      "Giving is less about what the church receives and more about what it loosens in the giver.",
    thumbnail:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2130,
    formats: ["video", "audio"],
    video: {
      src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      sizeBytes: 5.9 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      sizeBytes: 50 * MB,
    },
    tags: ["generosity", "stewardship"],
  },
  {
    slug: "first-things-first",
    title: "First Things First",
    speaker: "Esi Boateng",
    series: "Midweek Encounter",
    date: "2026-06-03",
    scripture: "Matthew 6:33",
    summary:
      "A short midweek word on ordering a crowded life around one non-negotiable.",
    thumbnail:
      "https://images.unsplash.com/photo-1523803326055-13445f07f1ef?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 1450,
    formats: ["audio"],
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      sizeBytes: 34 * MB,
    },
    tags: ["priorities", "midweek"],
  },
  {
    slug: "no-condemnation",
    title: "No Condemnation",
    speaker: "Pastor Samuel Adjei",
    series: "Rooted in Grace",
    date: "2026-05-31",
    scripture: "Romans 8:1–11",
    summary:
      "The most freeing sentence in the New Testament, taken slowly, one clause at a time.",
    thumbnail:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=70",
    durationSeconds: 2890,
    formats: ["video", "audio"],
    video: {
      src: "https://test-streams.mux.dev/tos_ismc/main.m3u8",
      sizeBytes: 8.9 * GB,
    },
    audio: {
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      sizeBytes: 66 * MB,
    },
    tags: ["grace", "freedom", "romans"],
  },
];

/**
 * Seed library — the fallback used when the Appwrite `messages` collection is
 * empty (fresh clone, or before the team has published anything). The live site
 * reads the database first; see lib/appwrite-server.ts.
 */
export const seedMessages: Message[] = messages;

/* ------------------------------------------------------------------ *
 * Pure helpers that operate on a supplied list, so they work the same
 * on the seed array or on records fetched from the database.
 * ------------------------------------------------------------------ */

/** Newest first. */
export function sortMessages(list: Message[]): Message[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

export function featuredFrom(list: Message[]): Message | undefined {
  const sorted = sortMessages(list);
  return sorted.find((m) => m.featured) ?? sorted[0];
}

export function seriesOf(list: Message[]): string[] {
  return Array.from(new Set(list.map((m) => m.series))).sort();
}

export function speakersOf(list: Message[]): string[] {
  return Array.from(new Set(list.map((m) => m.speaker))).sort();
}

export function relatedFrom(
  list: Message[],
  message: Message,
  limit = 3,
): Message[] {
  const others = sortMessages(list).filter((m) => m.slug !== message.slug);
  const sameSeries = others.filter((m) => m.series === message.series);
  const rest = others.filter((m) => m.series !== message.series);
  return [...sameSeries, ...rest].slice(0, limit);
}
