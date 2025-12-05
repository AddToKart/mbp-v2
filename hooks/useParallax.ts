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
  const { target, offset = DEFAULT_OFFSET, range = ["0%", "-10%"] } = options;
  const [isMounted, setIsMounted] = useState(false);

  const scroll = useScroll({
    target,
    offset,
  });

  const y = useTransform(scroll.scrollYProgress, [0, 1], range);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? y : undefined;
}
