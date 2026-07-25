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
    title: "Terms of Service",
    description: `The terms that govern your use of the ${site.name} website.`,
  };
}

export default async function TermsPage() {
  const { site } = await fetchContent();

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of Service"
      updated={UPDATED}
      intro={`These terms govern your use of the ${site.name} website. By using the site you agree to them.`}
    >
      <LegalSection title="Acceptance of these terms">
        <p>
          By accessing or using this website you agree to be bound by these
          Terms of Service and by our{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          . If you do not agree, please do not use the site.
        </p>
      </LegalSection>

      <LegalSection title="Use of the website">
        <p>
          You may use this website for personal, non-commercial purposes to
          watch and listen to messages, learn about {site.name}, and get in
          touch. You agree not to:
        </p>
        <LegalList
          items={[
            "Use the site in any way that breaks the law or infringes the rights of others.",
            "Attempt to gain unauthorised access to the site, its accounts, servers or systems.",
            "Disrupt or interfere with the security or proper working of the site.",
            "Copy, redistribute or resell the media or content except as allowed below.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Sermons and content">
        <p>
          Sermons, teaching, music, images and other content on this site are
          provided for personal worship, encouragement and study. You are
          welcome to share links to this site. You may not re-publish, sell or
          present the content as your own without our written permission. All
          content remains the property of {site.name} or its respective owners.
        </p>
      </LegalSection>

      <LegalSection title="Giving and donations">
        <p>
          Donations made through this site are voluntary gifts to {site.name}.
          Payments are handled by a third-party provider under their terms.
          Unless required by law, gifts are non-refundable. If you believe a gift
          was made in error, please contact us and we will do our best to help.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          Some areas of the site (such as the media studio) are restricted to
          authorised staff. If you are given access, you are responsible for
          keeping your sign-in credentials secure and for activity that happens
          under your account.
        </p>
      </LegalSection>

      <LegalSection title="Third-party links and services">
        <p>
          The site may link to, or rely on, third-party services (for example our
          streaming, sign-in and payment providers, or social media). We are not
          responsible for the content or practices of those third parties. Their
          own terms and privacy policies apply to your use of their services.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          This website and its content are provided &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo;, without warranties of any kind, whether
          express or implied. We do our best to keep the site accurate and
          available, but we do not guarantee that it will always be uninterrupted
          or error-free.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {site.name} will not be liable
          for any indirect or consequential loss arising from your use of, or
          inability to use, this website.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms from time to time. Changes take effect when
          posted on this page, and we will revise the &ldquo;last updated&rdquo;
          date above. Continued use of the site means you accept the updated
          terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          Questions about these terms? Email{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {site.email}
          </a>{" "}
          or use our{" "}
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
