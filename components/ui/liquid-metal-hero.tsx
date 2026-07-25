"use client";

import { useEffect, useState } from "react";
import { LiquidMetal, liquidMetalPresets } from "@paper-design/shaders-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LiquidMetalHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
  features?: string[];
  /** Base colour of the shader field. */
  colorBack?: string;
  /** Highlight colour that flows across the metal. */
  colorTint?: string;
  /** Slower values feel more reverent; 1 is the preset default. */
  speed?: number;
  className?: string;
  /** Rendered under the CTAs used for the "next service" strip. */
  children?: React.ReactNode;
}

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = [],
  colorBack = "#0b1020",
  colorTint = "#e6b155",
  speed = 0.42,
  className,
  children,
}: LiquidMetalHeroProps) {
  const reduceMotion = useReducedMotion();

  // The shader mounts a WebGL canvas, so it must not run during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-ink",
        className,
      )}
    >
      {mounted && (
        <LiquidMetal
          {...liquidMetalPresets[2].params}
          colorBack={colorBack}
          colorTint={colorTint}
          speed={reduceMotion ? 0 : speed}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
        />
      )}

      {/* Readability scrim: the shader is bright, the copy must still win. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] bg-gradient-to-b from-ink/75 via-ink/55 to-ink/90"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--ink)_100%)]"
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <motion.div
          className="space-y-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {badge && (
            <motion.div className="flex justify-center" variants={itemVariants}>
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/20"
              >
                {badge}
              </Badge>
            </motion.div>
          )}

          <motion.div className="space-y-6" variants={itemVariants}>
            <motion.h1
              role="heading"
              aria-level={1}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              variants={itemVariants}
            >
              {title}
            </motion.h1>

            <motion.p
              className="mx-auto max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={buttonVariants}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                onClick={onPrimaryCtaClick}
                size="lg"
                className="h-auto rounded-full bg-gold px-8 py-6 text-base font-semibold text-ink shadow-2xl shadow-black/40 transition-all duration-300 hover:bg-gold/90"
              >
                {primaryCtaLabel}
              </Button>
            </motion.div>

            {secondaryCtaLabel && onSecondaryCtaClick && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  onClick={onSecondaryCtaClick}
                  variant="outline"
                  size="lg"
                  className="h-auto rounded-full border-white/30 bg-white/5 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/15 hover:text-white"
                >
                  {secondaryCtaLabel}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {children && (
            <motion.div variants={itemVariants}>{children}</motion.div>
          )}

          {features.length > 0 && (
            <motion.div className="pt-12" variants={itemVariants}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-white/15 bg-white/10 shadow-2xl backdrop-blur-md">
                  <div className="p-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          className="flex items-center justify-center text-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.8 + index * 0.1,
                          }}
                        >
                          <p className="text-lg font-medium text-white/90">
                            {feature}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-hidden
      >
        <motion.div
          className="flex h-11 w-7 items-start justify-center rounded-full border border-white/30 p-1.5"
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="h-2 w-1 rounded-full bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
