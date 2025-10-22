"use client";

import { useScroll, useTransform, MotionValue } from "framer-motion";
import { RefObject, useEffect, useState } from "react";

type ScrollOffsetConfig = NonNullable<
  Parameters<typeof useScroll>[0]
>["offset"];

const DEFAULT_OFFSET: ScrollOffsetConfig = ["start end", "end start"];

interface ParallaxOptions {
  target: RefObject<HTMLElement>;
  offset?: ScrollOffsetConfig;
  range?: [string | number, string | number];
}

/**
 * Safe parallax hook that only runs on client-side after mount
 * Prevents SSR hydration errors with Framer Motion's useScroll
 */
export function useParallax(
  options: ParallaxOptions
): MotionValue<string | number> | undefined {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only create scroll progress on client
  let scrollYProgress: MotionValue<number> | undefined;

  if (isMounted) {
    // This will only run on client after mount
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const scroll = useScroll({
      target: options.target,
      offset: options.offset || DEFAULT_OFFSET,
    });
    scrollYProgress = scroll.scrollYProgress;
  }

  // Transform scroll to parallax value
  const y = scrollYProgress
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useTransform(scrollYProgress, [0, 1], options.range || ["0%", "-10%"])
    : undefined;

  return y;
}
