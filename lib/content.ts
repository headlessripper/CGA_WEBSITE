import { serviceTimes as seedServiceTimes, site as seedSite } from "@/lib/site";

/**
 * Editable site content.
 *
 * Every field here can be overridden from the Studio content editor and stored
 * in the Appwrite `content` collection (one document per top-level section,
 * keyed by the section name, `value` holding its JSON). Pages read the merged
 * result via `getSiteContent()` in lib/appwrite-server, which deep-merges the
 * stored values over these defaults — so the site works fully before anything
 * is edited, and the team replaces template copy piece by piece.
 */

export interface ServiceTimeContent {
  day: string;
  time: string;
  name: string;
  detail: string;
  weekday: number;
  startHour: number;
  startMinute: number;
}

export interface ConnectStep {
  title: string;
  body: string;
}

export interface SiteContent {
  site: {
    name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: { line1: string; line2: string; city: string; country: string };
    socials: { youtube: string; facebook: string; instagram: string };
    givingUrl: string;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    primaryCta: string;
    secondaryCta: string;
    features: string[];
  };
  serviceTimes: ServiceTimeContent[];
  connect: {
    title: string;
    description: string;
    plan: ConnectStep[];
  };
}

/** The section keys an editor may write. */
export type ContentSection = keyof SiteContent;

export const defaultContent: SiteContent = {
  site: {
    name: seedSite.name,
    tagline: seedSite.tagline,
    description: seedSite.description,
    email: seedSite.email,
    phone: seedSite.phone,
    address: { ...seedSite.address },
    socials: {
      youtube: seedSite.socials.youtube,
      facebook: seedSite.socials.facebook,
      instagram: seedSite.socials.instagram,
    },
    givingUrl: process.env.NEXT_PUBLIC_GIVING_URL ?? "",
  },
  home: {
    heroBadge: "✦ Sundays · 8:00 & 10:30 AM",
    heroTitle: seedSite.name,
    heroSubtitle:
      "A family learning to live loved. Gather with us in person, or watch and listen to every message wherever you are — in full HD, or audio-only when data is tight.",
    primaryCta: "Watch the latest message",
    secondaryCta: "Plan your first visit",
    features: [
      "Every service, on demand",
      "Audio-only for low data",
      "Notes you can follow along",
    ],
  },
  serviceTimes: seedServiceTimes.map((s) => ({ ...s })),
  connect: {
    title: "Start a conversation",
    description:
      "Whether you are planning a first visit, carrying something heavy, or ready to serve — this is the place to tell us. A real person reads every message.",
    plan: [
      {
        title: "Come as you are",
        body: "Turn up this Sunday — no dress code, no forms at the door. Someone from the welcome team will meet you and find you a seat.",
      },
      {
        title: "Meet the family",
        body: "Stay for coffee, or join us for a New Here lunch. We would rather answer your questions in person than have you leave with them.",
      },
      {
        title: "Find your place",
        body: "Join a small group and, when you are ready, a team to serve on. That is where church stops being a service you attend and becomes a family you belong to.",
      },
    ],
  },
};

/** Deep-merges a partial (from the DB) over the defaults. */
export function mergeContent(
  partial: Partial<Record<ContentSection, unknown>> | null | undefined,
): SiteContent {
  if (!partial) return defaultContent;
  const out = structuredClone(defaultContent) as SiteContent;
  for (const key of Object.keys(out) as ContentSection[]) {
    const stored = partial[key];
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      Object.assign(out[key] as object, stored);
    } else if (Array.isArray(stored)) {
      // Arrays (serviceTimes) replace wholesale rather than merge by index.
      (out as Record<ContentSection, unknown>)[key] = stored;
    }
  }
  return out;
}
