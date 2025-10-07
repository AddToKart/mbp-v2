"use client";

import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed top-6 right-6 z-50 p-3 rounded-full bg-surface shadow-lg border border-border w-12 h-12 theme-transition" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-surface shadow-lg hover:shadow-xl theme-transition border border-border hover:border-primary"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? 180 : 0,
          scale: theme === "dark" ? 1.1 : 1
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {theme === "light" ? (
          <MoonIcon className="w-6 h-6 text-text-primary" />
        ) : (
          <SunIcon className="w-6 h-6 text-accent" />
        )}
      </motion.div>
    </motion.button>
  );
}