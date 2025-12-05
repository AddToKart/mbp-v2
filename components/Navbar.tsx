"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "@/lib/motion";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ThemeSelector from "./ThemeSelector";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Check if we're on homepage to determine if navbar should be transparent
  const isHomePage = pathname === "/";

  const { scrollY } = useScroll();

  // Smooth opacity transition for the glass background
  // Starts fading in at 10px, fully visible at 100px
  const bgOpacity = useTransform(scrollY, [10, 100], [0, 1]);

  // Smooth blur transition
  const bgBlur = useTransform(scrollY, [10, 100], ["blur(0px)", "blur(16px)"]);

  // Shadow transition
  const bgShadow = useTransform(
    scrollY,
    [10, 100],
    ["0 0 0 rgba(0,0,0,0)", "0 4px 20px rgba(0,0,0,0.05)"]
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrolled = latest > 50;
    if (isScrolled !== scrolled) {
      setIsScrolled(scrolled);
    }
  });

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Announcements", href: "/announcements" },
    { name: "Services", href: "/#services" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 theme-transition`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Morphing Background Layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none border-b border-border/50"
        style={{
          opacity: isHomePage ? bgOpacity : 1,
          backdropFilter: isHomePage ? bgBlur : "blur(16px)",
          backgroundColor: "var(--glass-bg)", // Always use the glass color, opacity controls visibility
          boxShadow: isHomePage ? bgShadow : "0 4px 20px rgba(0,0,0,0.05)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-xl">
                  SM
                </span>
              </div>
              <div className="hidden sm:block">
                <h1
                  className={`font-bold text-lg transition-colors duration-300 ${
                    isScrolled || !isHomePage
                      ? "text-foreground"
                      : isDarkMode
                        ? "text-white"
                        : "text-slate-900"
                  }`}
                >
                  Santa Maria
                </h1>
                <p
                  className={`text-xs transition-colors duration-300 ${
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
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href}>
                  <div
                    className="relative px-4 py-2 rounded-full cursor-pointer group"
                    onMouseEnter={() => setHoveredPath(link.href)}
                    onMouseLeave={() => setHoveredPath(null)}
                  >
                    {/* Lava Lamp Hover Effect */}
                    {hoveredPath === link.href && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                        layoutId="navbar-hover"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 25,
                        }}
                      />
                    )}

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-primary rounded-full"
                        layoutId="navbar-active"
                      />
                    )}

                    <span
                      className={`relative font-medium text-sm transition-colors duration-300 ${
                        isScrolled || !isHomePage
                          ? "text-foreground group-hover:text-primary"
                          : isDarkMode
                            ? "text-white/90 group-hover:text-white"
                            : "text-slate-800 group-hover:text-slate-900"
                      }`}
                    >
                      {link.name}
                    </span>
                  </div>
                </Link>
              );
            })}

            <div className="w-px h-6 bg-border mx-2 opacity-50" />

            <Link href="/login">
              <motion.button
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all border ${
                  isScrolled || !isHomePage
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-md shadow-primary/20"
                    : isDarkMode
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                      : "bg-slate-900/10 text-slate-900 border-slate-900/20 hover:bg-slate-900/20 backdrop-blur-sm"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            <div className="ml-2">
              <ThemeSelector isTransparent={!isScrolled && isHomePage} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <motion.button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  isScrolled || !isHomePage
                    ? "bg-primary text-primary-foreground border-transparent"
                    : isDarkMode
                      ? "bg-white/10 text-white border-white/20"
                      : "bg-slate-900/10 text-slate-900 border-slate-900/20"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            <ThemeSelector isTransparent={!isScrolled && isHomePage} />
            <button
              className={`p-2 rounded-md transition-colors ${
                isScrolled || !isHomePage
                  ? "text-foreground hover:bg-muted"
                  : isDarkMode
                    ? "text-white hover:bg-white/10"
                    : "text-slate-900 hover:bg-slate-900/10"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          id="mobile-menu"
          className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <div
                  className="block px-4 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary smooth-transition font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
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
