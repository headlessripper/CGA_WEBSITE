"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // The home page opens on the dark shader hero, so the bar starts transparent
  // there and only picks up a surface once you scroll past it.
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" className="shrink-0" aria-label={"Centre of Grace Assembly home"}>
          <Logo invert={overHero} />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  overHero
                    ? "text-white/75 hover:text-white"
                    : "text-muted-foreground hover:text-foreground",
                  active && (overHero ? "text-white" : "text-foreground"),
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className={cn(
                      "absolute inset-0 -z-10 rounded-full",
                      overHero ? "bg-white/15" : "bg-accent",
                    )}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle
            className={cn(
              overHero
                ? "border-white/20 text-white hover:bg-white/15"
                : "border-border bg-transparent text-foreground hover:bg-accent",
            )}
          />

          <Button
            asChild
            size="sm"
            className="hidden rounded-full bg-gold px-5 font-semibold text-ink hover:bg-gold/90 sm:inline-flex"
          >
            <Link href="/messages">
              <Radio className="mr-2 h-4 w-4" />
              Watch
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:hidden",
                  overHero
                    ? "border-white/20 bg-white/5 text-white"
                    : "border-border text-foreground hover:bg-accent",
                )}
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l-border sm:max-w-sm">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-full flex-col p-6">
                <Logo />
                <AnimatePresence>
                  <div className="mt-10 flex flex-col gap-1">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                      >
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            className="block border-b border-border/60 py-4 font-display text-2xl font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                <div className="mt-auto space-y-3 pt-8">
                  <Button
                    asChild
                    className="w-full rounded-full bg-gold font-semibold text-ink hover:bg-gold/90"
                  >
                    <Link href="/messages">Watch & listen</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href="/give">Give</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
