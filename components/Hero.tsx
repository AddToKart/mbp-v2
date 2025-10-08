"use client";

import { motion, useReducedMotion } from "@/lib/motion";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo } from "react";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const heroBackground = useMemo(
    () =>
      "https://images.unsplash.com/photo-1552633873-a7c526fcf3a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBtdW5pY2lwYWxpdHklMjBoYWxsJTIwbW9kZXJuJTIwYXJjaGl0ZWN0dXJlfGVufDB8MHx8Ymx1ZXwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    []
  );

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="relative pt-32 pb-28 sm:pt-40 sm:pb-32">
        {/* Decorative background */}
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0">
            <Image
              src={heroBackground}
              alt="Santa Maria municipal building"
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwMCcgaGVpZ2h0PSc2MjUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzEwMDAnIGhlaWdodD0nNjI1JyBmaWxsPSIjMTYyODM5IiAvPjwvc3ZnPg=="
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/85 to-background/70 dark:from-background dark:via-background/70 dark:to-background/40" />
        </motion.div>

        {/* Radial accent */}
        <div className="absolute inset-x-0 top-32 -z-10 flex justify-center">
          <div className="h-72 w-[min(90%,40rem)] rounded-full bg-primary/10 blur-3xl dark:bg-primary/30" />
        </div>

        {/* Copy */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="rounded-3xl border border-border/60 bg-surface/80 p-10 sm:p-12 lg:p-16 shadow-xl backdrop-blur-xl transition-colors dark:border-border/40 dark:bg-surface/60"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground shadow-sm dark:border-border/40 dark:bg-background/40"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Serving Santa Maria since 1965
            </motion.div>

            <motion.h1
              className="mt-6 text-foreground text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              Empowering our municipality with transparency and trust
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.45,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              Stay informed with timely announcements, accessible public
              services, and initiatives that strengthen community engagement.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.55,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              <Link href="/announcements">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-3 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    Latest Updates
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-3 font-semibold border-border/70 text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  Transparency Portal
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute inset-x-0 bottom-10 flex justify-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 1,
          repeat: shouldReduceMotion ? 0 : Infinity,
          repeatType: "reverse",
        }}
      >
        <ChevronDownIcon className="h-8 w-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
