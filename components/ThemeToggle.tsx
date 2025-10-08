"use client";

import { motion } from "@/lib/motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  isTransparent?: boolean;
}

export default function ThemeToggle({
  className = "",
  isTransparent = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Trigger theme change immediately for instant response
    toggleTheme();

    // Reset animation lock
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  if (!mounted) {
    return (
      <div
        className={`size-9 rounded-full bg-card border border-border flex items-center justify-center ${className}`}
      />
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        onClick={handleToggle}
        variant="outline"
        size="icon"
        className={`rounded-full hover:bg-primary/10 hover:border-primary ${
          isTransparent
            ? "border-white/50 bg-white/10 text-white hover:bg-white/20"
            : ""
        } ${className}`}
        aria-label="Toggle theme"
        disabled={isAnimating}
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
            <MoonIcon
              className={`w-5 h-5 ${isTransparent ? "text-white" : ""}`}
            />
          ) : (
            <SunIcon
              className={`w-5 h-5 ${
                isTransparent ? "text-white" : "text-accent"
              }`}
            />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
}
