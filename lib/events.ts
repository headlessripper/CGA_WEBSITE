export interface ChurchEvent {
  /** Appwrite document id, present on records read from the database. */
  id?: string;
  slug: string;
  title: string;
  /** ISO datetime. */
  start: string;
  end?: string;
  location: string;
  category: "Gathering" | "Youth" | "Outreach" | "Training" | "Special";
  description: string;
  image: string;
  registrationUrl?: string;
}

export const events: ChurchEvent[] = [
  {
    slug: "night-of-grace-august",
    title: "Night of Grace August",
    start: "2026-08-07T19:00:00+00:00",
    end: "2026-08-07T22:00:00+00:00",
    location: "Main Auditorium",
    category: "Special",
    description:
      "Three hours of unhurried worship, testimony and prayer. Doors open at 6:30 PM. Everyone welcome bring someone with you.",
    image:
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1400&q=70",
  },
  {
    slug: "grace-kids-holiday-club",
    title: "Grace Kids Holiday Club",
    start: "2026-08-11T09:00:00+00:00",
    end: "2026-08-14T13:00:00+00:00",
    location: "Grace Kids Wing",
    category: "Youth",
    description:
      "Four mornings of Bible stories, craft, sport and far too much noise. Ages 4–12. Free, but please register so we can plan.",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=70",
    registrationUrl: "/connect",
  },
  {
    slug: "new-members-lunch",
    title: "New Here? Lunch",
    start: "2026-08-16T12:30:00+00:00",
    location: "The Courtyard",
    category: "Gathering",
    description:
      "A relaxed lunch after second service for anyone who has joined us in the last few months. Meet the pastors, ask anything.",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=70",
    registrationUrl: "/connect",
  },
  {
    slug: "community-food-drive",
    title: "Community Food Drive",
    start: "2026-08-22T08:00:00+00:00",
    end: "2026-08-22T14:00:00+00:00",
    location: "Church Car Park",
    category: "Outreach",
    description:
      "We are packing and delivering 400 food parcels across the neighbourhood. Come for an hour or stay for the day.",
    image:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1400&q=70",
    registrationUrl: "/connect",
  },
  {
    slug: "worship-team-workshop",
    title: "Worship Team Workshop",
    start: "2026-08-29T10:00:00+00:00",
    end: "2026-08-29T15:00:00+00:00",
    location: "Rehearsal Hall",
    category: "Training",
    description:
      "For current and prospective team members: vocal technique, in-ear mixing, and building a set that serves the room.",
    image:
      "https://images.unsplash.com/photo-1523803326055-13445f07f1ef?auto=format&fit=crop&w=1400&q=70",
    registrationUrl: "/connect",
  },
  {
    slug: "baptism-sunday",
    title: "Baptism Sunday",
    start: "2026-09-06T10:30:00+00:00",
    location: "Main Auditorium",
    category: "Special",
    description:
      "One of the best days of our year. If you would like to be baptised, let us know on the Connect page and we will get in touch.",
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1400&q=70",
    registrationUrl: "/connect",
  },
];

/** Fallback list, used when the Appwrite `events` collection is empty. */
export const seedEvents: ChurchEvent[] = events;

/** Upcoming (not-yet-ended) events, soonest first pure, on any list. */
export function upcomingFrom(
  list: ChurchEvent[],
  from: Date = new Date(),
): ChurchEvent[] {
  return [...list]
    .filter((e) => new Date(e.end ?? e.start).getTime() >= from.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
}
