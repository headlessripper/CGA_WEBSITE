import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/site/logo";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/site/social-icons";
import { Separator } from "@/components/ui/separator";
import { fetchContent } from "@/lib/appwrite-server";
import { navLinks } from "@/lib/site";

export async function Footer() {
  const { site, serviceTimes } = await fetchContent();
  const socials = [
    { href: site.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: site.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-card/40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.tagline} Gathering weekly in {site.address.city}, and
              wherever you are watching from.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-gold">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[...navLinks, { href: "/give", label: "Give" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-gold">
              Gathering times
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {serviceTimes.map((s) => (
                <li key={`${s.day}-${s.time}`} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{s.day}</span>{" "}
                  · {s.time}
                  <span className="block text-xs">{s.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-gold">
              Find us
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                  <br />
                  {site.address.city}, {site.address.country}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-foreground"
                >
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`mailto:${site.email}`}
                  className="break-all transition-colors hover:text-foreground"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-border/60" />

        <div className="flex flex-col items-center gap-5 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <span aria-hidden className="text-border">
              |
            </span>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <p className="font-display italic">
              &ldquo;By grace you have been saved, through faith.&rdquo; —
              Ephesians 2:8
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
