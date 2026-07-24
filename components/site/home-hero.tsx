"use client";

import { useRouter } from "next/navigation";

import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import { NextService } from "@/components/site/next-service";
import type { SiteContent } from "@/lib/content";

export function HomeHero({
  home,
  services,
}: {
  home: SiteContent["home"];
  services: SiteContent["serviceTimes"];
}) {
  const router = useRouter();

  return (
    <LiquidMetalHero
      badge={home.heroBadge}
      title={home.heroTitle}
      subtitle={home.heroSubtitle}
      primaryCtaLabel={home.primaryCta}
      secondaryCtaLabel={home.secondaryCta}
      onPrimaryCtaClick={() => router.push("/messages")}
      onSecondaryCtaClick={() => router.push("/connect")}
      features={home.features}
    >
      <NextService services={services} />
    </LiquidMetalHero>
  );
}
