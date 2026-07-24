import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

/**
 * Chrome for the public-facing site: the nav bar, the shared footer, and the
 * bottom padding that keeps content clear of the audio dock. The Studio lives
 * outside this group, so it gets none of it.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2.5 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="min-h-screen pb-28">
        {children}
      </main>
      <Footer />
    </>
  );
}
