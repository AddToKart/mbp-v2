"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import MariBot from "@/components/MariBot";
import {
  LazyMotion,
  motion,
  useReducedMotion,
  loadMotionFeatures,
} from "@/lib/motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Check if we're on an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    // After initial render, enable animations for subsequent navigations
    setIsInitialLoad(false);
  }, []);

  const initialMotion = isInitialLoad
    ? false
    : prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 24, scale: 0.98 };

  const animateMotion = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  return (
    <ThemeProvider>
      <LazyMotion features={loadMotionFeatures} strict>
        {/* Only show Navbar on non-admin routes */}
        {!isAdminRoute && <Navbar />}
        <motion.div
          key={pathname}
          initial={initialMotion}
          animate={animateMotion}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          {children}
        </motion.div>
        {/* Only show MariBot on non-admin routes */}
        {!isAdminRoute && <MariBot />}
      </LazyMotion>
    </ThemeProvider>
  );
}
