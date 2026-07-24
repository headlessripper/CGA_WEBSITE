import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: "Studio sign in",
  robots: { index: false, follow: false },
};

export default function StudioSignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-5 py-24">
      <Logo />
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">Media Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to publish messages and edit the site.
        </p>
      </div>
      <SignIn
        appearance={{
          variables: { colorPrimary: "#c8962e", borderRadius: "0.75rem" },
        }}
      />
    </div>
  );
}
