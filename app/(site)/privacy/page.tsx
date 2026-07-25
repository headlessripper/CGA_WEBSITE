import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/site/legal-layout";
import { fetchContent } from "@/lib/appwrite-server";

export const dynamic = "force-dynamic";

const UPDATED = "24 July 2026";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await fetchContent();
  return {
    title: "Privacy Policy",
    description: `How ${site.name} collects, uses and protects your personal information.`,
  };
}

export default async function PrivacyPage() {
  const { site } = await fetchContent();

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      updated={UPDATED}
      intro={`${site.name} respects your privacy. This policy explains what information we collect through this website, how we use it, and the choices you have.`}
    >
      <LegalSection title="Who we are">
        <p>
          This website is operated by {site.name} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;), located at {site.address.line1},
          {" "}
          {site.address.line2}, {site.address.city}, {site.address.country}. For
          any privacy question you can reach us at{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {site.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We only collect what we need to serve you well:</p>
        <LegalList
          items={[
            <>
              <strong className="text-foreground">
                Information you give us.
              </strong>{" "}
              When you use the Connect form we collect your name, email address,
              optional phone number and the message you send us (which may
              include a prayer request you choose to share).
            </>,
            <>
              <strong className="text-foreground">Giving.</strong> Donations are
              processed by a third-party payment provider on their own secure
              pages. We never see or store your card or bank details.
            </>,
            <>
              <strong className="text-foreground">Technical data.</strong> Like
              most websites, our host records standard server logs (such as IP
              address, browser type and pages requested) to keep the site
              secure and reliable.
            </>,
            <>
              <strong className="text-foreground">Preferences.</strong> We store
              a small setting in your browser to remember your light or dark
              theme choice.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="How we use your information">
        <LegalList
          items={[
            "To respond to your messages, prayer requests and connection cards.",
            "To let you watch and listen to sermons and other media.",
            "To keep the website secure, available and working correctly.",
            "To understand, in aggregate, how the site is used so we can improve it.",
          ]}
        />
        <p>
          We do not sell your personal information, and we do not use it for
          advertising.
        </p>
      </LegalSection>

      <LegalSection title="Service providers we rely on">
        <p>
          We use trusted providers to run this site. They process data only on
          our instructions:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Appwrite</strong> stores our
              sermon media and site content, and the messages submitted through
              the Connect form.
            </>,
            <>
              <strong className="text-foreground">Clerk</strong> provides
              secure sign-in for our staff who manage the site.
            </>,
            <>
              <strong className="text-foreground">Vercel</strong> hosts and
              delivers the website.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep the messages you send us for as long as needed to care for you
          and respond, and then only as our internal records require. You can
          ask us to delete your information at any time.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You may ask us to access, correct or delete the personal information
          we hold about you, or to stop contacting you. To make a request, email
          us at{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {site.email}
          </a>
          . We will respond within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          This website is intended for a general audience. We do not knowingly
          collect personal information from children without the involvement of a
          parent or guardian. If you believe a child has provided us information,
          please contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use only the minimal storage needed for the site to function for
          example, remembering your theme preference and keeping staff signed in.
          We do not use advertising or cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy from time to time. When we do, we will revise
          the &ldquo;last updated&rdquo; date above. Significant changes will be
          made clear on this page.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          If you have any questions about this policy or your information, please
          email{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {site.email}
          </a>{" "}
          or reach out through our{" "}
          <Link
            href="/connect"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Connect page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
