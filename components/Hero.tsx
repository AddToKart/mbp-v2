"use client";
import { motion, useReducedMotion } from "@/lib/motion";
import OptimizedImage from "@/components/OptimizedImage";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import bgHall from "@/images/bg_hall.jpg";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  // Noise texture data URI
  const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

  return (
    <section
      className="relative isolate overflow-hidden bg-background"
      aria-labelledby="hero-heading"
    >
      <div className="relative pt-32 pb-28 sm:pt-40 sm:pb-32">
        {/* Decorative background with dynamic movement */}
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: 1,
            scale: [1.05, 1.1, 1.05],
            rotate: [0, 0.5, -0.5, 0],
          }}
          transition={{
            opacity: { duration: 1.2, ease: "easeOut" },
            scale: {
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            },
            rotate: {
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            },
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0">
            <OptimizedImage
              src={bgHall}
              alt="Santa Maria municipal building"
              priority
              sizes="100vw"
              className="object-cover"
              enableHover={false}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/75 to-background/85 dark:from-background/30 dark:via-background/50 dark:to-background/70" />
        </motion.div>

        {/* Radial accent */}
        <div
          className="absolute inset-x-0 top-32 -z-10 flex justify-center"
          aria-hidden="true"
        >
          <div className="h-72 w-[min(90%,40rem)] rounded-full bg-primary/10 blur-3xl dark:bg-primary/30" />
        </div>

        {/* Copy */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-10 sm:p-12 lg:p-16 shadow-2xl backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-black/20"
            style={{
              backgroundImage: noiseTexture,
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {/* Glass Highlight */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent opacity-50 rounded-3xl" />

            <motion.div
              className="relative inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ translateX: ["-100%", "200%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />
              <span className="relative z-10">
                Serving Santa Maria since 1965
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="mt-6 text-foreground text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-sm"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              Empowering our municipality with service and trust
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-foreground/90 leading-relaxed max-w-3xl mx-auto font-medium drop-shadow-sm"
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
                    className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
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
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-semibold border-primary/20 bg-white/5 backdrop-blur-sm text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                >
                  <Link href="/#services" scroll>
                    Explore Services
                  </Link>
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
        aria-hidden="true"
      >
        <ChevronDownIcon className="h-8 w-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
