"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  suffix = "",
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;

    if (reduceMotion) {
      node.textContent = value.toLocaleString() + suffix;
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString() + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix, duration, motionValue, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
