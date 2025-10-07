"use client";

import { motion, useReducedMotion } from "@/lib/motion";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1552633873-a7c526fcf3a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBtdW5pY2lwYWxpdHklMjBoYWxsJTIwbW9kZXJuJTIwYXJjaGl0ZWN0dXJlfGVufDB8MHx8Ymx1ZXwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85"
            alt="Santa Maria municipal building"
            fill
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwMCcgaGVpZ2h0PSc2MjUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzEwMDAnIGhlaWdodD0nNjI1JyBmaWxsPSIjMTYyODM5IiAvPjwvc3ZnPg=="
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary-dark/80 to-secondary/70" />
      </motion.div>

      {/* Glass Card Content */}
      <motion.div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          className="glass-effect rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="heading-xl text-white mb-4">
              Santa Maria Municipal
            </h1>
          </motion.div>

          <motion.p
            className="body-lg text-white/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Your trusted source for government announcements, transparency
            reports, and community updates. Building a better future together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link href="/announcements">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="px-8 bg-white text-primary hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl font-semibold"
                >
                  Latest Updates
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 border-2 border-white text-white hover:bg-white/10 rounded-full bg-transparent font-semibold"
              >
                Transparency Portal
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 1,
          repeat: shouldReduceMotion ? 0 : Infinity,
          repeatType: "reverse",
        }}
      >
        <ChevronDownIcon className="w-8 h-8 text-white" />
      </motion.div>
    </section>
  );
}
