import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-7xl font-semibold text-gradient-gold">
        404
      </p>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        We could not find that page
      </h1>
      <p className="mt-4 text-muted-foreground">
        It may have moved, or the link may have a typo in it. The message
        library is the best place to start looking.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-gold font-semibold text-ink hover:bg-gold/90">
          <Link href="/messages">Browse messages</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full font-semibold">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
