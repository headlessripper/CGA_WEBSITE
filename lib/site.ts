/**
 * Single source of truth for church details.
 * Everything marked PLACEHOLDER must be replaced with the real information
 * before launch — addresses, phone numbers and giving details especially.
 */

export const site = {
  name: "Centre of Grace Assembly",
  shortName: "CGA",
  tagline: "A place where grace finds you.",
  description:
    "Centre of Grace Assembly is a family of believers gathering weekly to worship, grow and serve. Watch and listen to every message, wherever you are.",
  url: "https://centreofgraceassembly.org", // PLACEHOLDER
  email: "hello@centreofgraceassembly.org", // PLACEHOLDER
  phone: "+233 20 000 0000", // PLACEHOLDER
  address: {
    line1: "12 Grace Avenue", // PLACEHOLDER
    line2: "East Legon",
    city: "Accra",
    country: "Ghana",
  },
  socials: {
    youtube: "https://youtube.com/@centreofgraceassembly", // PLACEHOLDER
    facebook: "https://facebook.com/centreofgraceassembly", // PLACEHOLDER
    instagram: "https://instagram.com/centreofgraceassembly", // PLACEHOLDER
    spotify: "https://open.spotify.com/show/placeholder", // PLACEHOLDER
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/messages", label: "Messages" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/connect", label: "Connect" },
] as const;

export type ServiceTime = {
  day: string;
  time: string;
  name: string;
  detail: string;
  /** 0 = Sunday, matches Date#getDay(). */
  weekday: number;
  /** 24h start time, used for the live countdown. */
  startHour: number;
  startMinute: number;
};

export const serviceTimes: ServiceTime[] = [
  {
    day: "Sunday",
    time: "8:00 AM",
    name: "First Service",
    detail: "Worship, the Word and communion.",
    weekday: 0,
    startHour: 8,
    startMinute: 0,
  },
  {
    day: "Sunday",
    time: "10:30 AM",
    name: "Second Service",
    detail: "Full band worship with children's church running alongside.",
    weekday: 0,
    startHour: 10,
    startMinute: 30,
  },
  {
    day: "Wednesday",
    time: "6:30 PM",
    name: "Midweek Encounter",
    detail: "Teaching, testimony and prayer.",
    weekday: 3,
    startHour: 18,
    startMinute: 30,
  },
  {
    day: "Friday",
    time: "7:00 PM",
    name: "Night of Grace",
    detail: "Extended worship and intercession, first Friday of the month.",
    weekday: 5,
    startHour: 19,
    startMinute: 0,
  },
];

export const ministries = [
  {
    title: "Grace Kids",
    description:
      "Ages 3–12. Bible stories, worship and games in a space built just for them, running through both Sunday services.",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=70",
    icon: "Baby",
  },
  {
    title: "Youth & Campus",
    description:
      "Ages 13–24. Honest conversation, mentorship and a community that walks with you through school and beyond.",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=70",
    icon: "Flame",
  },
  {
    title: "Worship & Creative",
    description:
      "Singers, musicians, media and production — the team that carries the sound and the story of the house.",
    image:
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=70",
    icon: "Music",
  },
  {
    title: "Care & Outreach",
    description:
      "Hospital visits, food support and community projects. Grace received is grace given away.",
    image:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1200&q=70",
    icon: "HeartHandshake",
  },
] as const;

export const leadership = [
  {
    name: "Pastor Samuel Adjei",
    role: "Lead Pastor",
    bio: "Samuel has served the Centre of Grace family since its first meeting in a living room in 2009. They teach verse by verse and love a long lunch afterwards.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Pastor Naa Adjeley Mensah",
    role: "Associate Pastor, Care",
    bio: "Naa leads the care and counselling team and oversees the small groups that keep the church feeling small as it grows.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Kwame Osei",
    role: "Worship Director",
    bio: "Kwame has been writing songs for the house for a decade and leads the team of forty who serve across services.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Esi Boateng",
    role: "Youth & Campus Pastor",
    bio: "Esi builds the bridge between Sunday and the rest of the week for students across three campuses.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=70",
  },
] as const;

export const beliefs = [
  {
    title: "The Scriptures",
    body: "We believe the Bible is the inspired, infallible Word of God and the final authority for faith and practice.",
  },
  {
    title: "One God, three persons",
    body: "We believe in one God eternally existing as Father, Son and Holy Spirit.",
  },
  {
    title: "Salvation by grace",
    body: "We believe salvation is the gift of God, received by grace through faith in Jesus Christ alone — never earned.",
  },
  {
    title: "The Holy Spirit",
    body: "We believe the Holy Spirit indwells, empowers and gifts every believer for a life of witness and service.",
  },
  {
    title: "The Church",
    body: "We believe the Church is the body of Christ, called to gather, grow and go into the world with the gospel.",
  },
  {
    title: "The return of Christ",
    body: "We believe Jesus will return in glory, and that we live now in the hope of that day.",
  },
] as const;

export const faqs = [
  {
    q: "What time should I arrive?",
    a: "Ten minutes before the service starts is perfect. Someone from the welcome team will meet you at the door, show you around and find you a seat.",
  },
  {
    q: "What do people wear?",
    a: "Whatever you are comfortable in. You will see everything from traditional wear to jeans and trainers.",
  },
  {
    q: "Is there something for my children?",
    a: "Yes. Grace Kids runs for ages 3–12 during both Sunday services, with a secure check-in and check-out system.",
  },
  {
    q: "How long is a service?",
    a: "About ninety minutes, including worship, the message and a time of prayer.",
  },
  {
    q: "Can I watch online?",
    a: "Every service is streamed live and posted here within a few hours. Audio-only versions are published the same day for anyone on a limited data plan.",
  },
  {
    q: "How do I get involved?",
    a: "Start with a Sunday, then join a small group. When you are ready to serve, tell us on the Connect page and a team leader will reach out.",
  },
] as const;
