"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "@/lib/motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ThemeSelector from "./ThemeSelector";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const isDarkMode = theme === "dark";

  // Check if we're on homepage to determine if navbar should be transparent
  const isHomePage = pathname === "/";

  const { scrollY } = useScroll();

  // Smooth opacity transition for the glass background
  const bgOpacity = useTransform(scrollY, [10, 100], [0, 1]);
  const bgBlur = useTransform(scrollY, [10, 100], ["blur(0px)", "blur(16px)"]);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    router.push("/");
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Check if user is logged in and should see profile
  // Only show profile for: approved citizens, admins, validators
  // Also controls visibility of "Community" tab
  const isLoggedIn = !!user && !isLoading && (
    user.role === "admin" ||
    user.role === "validator" ||
    (user.role === "citizen" && user.verificationStatus === "approved")
  );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Announcements", href: "/announcements" },
    { name: "Services", href: "/#services" },
    ...(isLoggedIn ? [{ name: "Community", href: "/community" }] : []),
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
          backgroundColor: "var(--glass-bg)",
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
                  className={`font-bold text-lg transition-colors duration-300 ${isScrolled || !isHomePage
                    ? "text-foreground"
                    : isDarkMode
                      ? "text-white"
                      : "text-slate-900"
                    }`}
                >
                  Santa Maria
                </h1>
                <p
                  className={`text-xs transition-colors duration-300 ${isScrolled || !isHomePage
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
                      className={`relative font-medium text-sm transition-colors duration-300 ${isScrolled || !isHomePage
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

            {/* Profile or Login Button */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition-all border ${isScrolled || !isHomePage
                    ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    : isDarkMode
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      : "bg-slate-900/10 text-slate-900 border-slate-900/20 hover:bg-slate-900/20"
                    }`}
                >
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getUserInitials()}
                  </div>
                  <span className="hidden lg:block max-w-[100px] truncate">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-muted/50 border-b border-border">
                      <p className="font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setIsProfileOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors cursor-pointer">
                          <UserCircleIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-foreground">Profile</span>
                        </div>
                      </Link>
                      <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors cursor-pointer">
                          <Cog6ToothIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-foreground">Account Settings</span>
                        </div>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer w-full"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-500">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all border ${isScrolled || !isHomePage
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
            )}

            <div className="ml-2">
              <ThemeSelector isTransparent={!isScrolled && isHomePage} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Profile or Login */}
            {isLoggedIn ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`p-2 rounded-lg transition-colors ${isScrolled || !isHomePage
                  ? "text-foreground hover:bg-muted"
                  : isDarkMode
                    ? "text-white hover:bg-white/10"
                    : "text-slate-900 hover:bg-slate-900/10"
                  }`}
              >
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getUserInitials()}
                </div>
              </button>
            ) : (
              <Link href="/login">
                <motion.button
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isScrolled || !isHomePage
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
            )}

            <ThemeSelector isTransparent={!isScrolled && isHomePage} />
            <button
              className={`p-2 rounded-md transition-colors ${isScrolled || !isHomePage
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

            {/* Mobile Profile Menu Items */}
            {isLoggedIn && (
              <>
                <div className="border-t border-border my-2" />
                <div className="px-4 py-2">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary smooth-transition font-medium">
                    <UserCircleIcon className="w-5 h-5" />
                    Profile
                  </div>
                </Link>
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary smooth-transition font-medium">
                    <Cog6ToothIcon className="w-5 h-5" />
                    Account Settings
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 smooth-transition font-medium w-full"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Mobile Profile Dropdown (overlay) */}
      {isLoggedIn && isProfileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 right-4 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-muted/50 border-b border-border">
              <p className="font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link href="/profile" onClick={() => setIsProfileOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors">
                  <UserCircleIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Profile</span>
                </div>
              </Link>
              <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors">
                  <Cog6ToothIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Account Settings</span>
                </div>
              </Link>
            </div>
            <div className="border-t border-border py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-500">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.nav>
  );
}
