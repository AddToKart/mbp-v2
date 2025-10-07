"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
    </ThemeProvider>
  );
}
