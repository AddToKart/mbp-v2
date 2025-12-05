"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  SunIcon,
  MoonIcon,
  SparklesIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface ThemeSelectorProps {
  className?: string;
  isTransparent?: boolean;
}

export default function ThemeSelector({
  className = "",
  isTransparent = false,
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`size-9 rounded-full bg-card border border-border flex items-center justify-center ${className}`}
      />
    );
  }

  const themes = [
    { id: "light", name: "Light Mode", icon: SunIcon },
    { id: "dark", name: "Dark Mode", icon: MoonIcon },
    { id: "glass", name: "Glassmorphism", icon: SparklesIcon },
  ] as const;

  const activeTheme = themes.find((t) => t.id === theme) || themes[0];
  const ActiveIcon = activeTheme.icon;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full transition-colors ${
            isTransparent
              ? "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
              : "hover:bg-primary/10 hover:border-primary"
          } ${isOpen ? "ring-2 ring-primary ring-offset-2" : ""}`}
        >
          <ActiveIcon className="w-5 h-5" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg shadow-black/5 backdrop-blur-xl z-50"
          >
            <div className="space-y-0.5">
              {themes.map((item) => {
                const Icon = item.icon;
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTheme"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
