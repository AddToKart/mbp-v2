"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { LazyMotion } from "framer-motion";
import { AnimatePresence, motion } from "@/lib/motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const loadMotionFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // After initial render, enable animations for subsequent navigations
    setIsInitialLoad(false);
  }, []);

  return (
    <ThemeProvider>
      <LazyMotion features={loadMotionFeatures} strict>
        <Navbar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={isInitialLoad ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </LazyMotion>
    </ThemeProvider>
  );
}
