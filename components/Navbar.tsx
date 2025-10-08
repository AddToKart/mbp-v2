"use client";

import { motion } from "@/lib/motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Check if we're on homepage to determine if navbar should be transparent
  const isHomePage = pathname === "/";

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 50);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Announcements", href: "/announcements" },
    { name: "Services", href: "/#services" },
    { name: "Transparency", href: "/#transparency" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 theme-transition ${
        isScrolled || !isHomePage
          ? "bg-card/95 backdrop-blur-md shadow-lg border-b border-border/50 text-text-primary"
          : isDarkMode
          ? "bg-transparent text-white"
          : "bg-transparent text-slate-900"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SM</span>
              </div>
              <div className="hidden sm:block">
                <h1
                  className={`font-bold text-lg ${
                    isScrolled || !isHomePage
                      ? "text-text-primary"
                      : isDarkMode
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  Santa Maria
                </h1>
                <p
                  className={`text-xs ${
                    isScrolled || !isHomePage
                      ? "text-muted-foreground"
                      : isDarkMode
                      ? "text-white/80"
                      : "text-slate-600"
                  }`}
                >
                  Municipal Government
                </p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <motion.span
                  className={`hover:text-primary smooth-transition font-medium cursor-pointer ${
                    isScrolled || !isHomePage
                      ? "text-text-primary"
                      : isDarkMode
                      ? "text-white/90"
                      : "text-slate-900"
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.span>
              </Link>
            ))}
            <ThemeToggle isTransparent={!isScrolled && isHomePage} />
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle isTransparent={!isScrolled && isHomePage} />
            <button
              className={`p-2 ${
                isScrolled || !isHomePage
                  ? "text-text-primary"
                  : isDarkMode
                  ? "text-white"
                  : "text-slate-900"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-card border-t border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <div
                  className="block py-2 text-text-primary hover:text-primary smooth-transition font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
