import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";

/** Shared shell for the Privacy Policy and Terms pages. */
export function LegalLayout({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={intro}>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </PageHeader>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
        <Reveal>
          <div className="space-y-8 leading-relaxed text-muted-foreground">
            {children}
          </div>
        </Reveal>
      </section>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-1 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
