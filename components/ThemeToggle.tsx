"use client";

import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-full bg-surface border border-border theme-transition flex items-center justify-center ${className}`} />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full bg-surface hover:bg-primary/10 theme-transition border border-border hover:border-primary flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="flex items-center justify-center"
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? 180 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {theme === "light" ? (
          <MoonIcon className="w-5 h-5 text-text-primary" />
        ) : (
          <SunIcon className="w-5 h-5 text-accent" />
        )}
      </motion.div>
    </motion.button>
  );
}