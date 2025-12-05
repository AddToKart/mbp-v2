"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LazyMotion,
  motion,
  AnimatePresence,
  useReducedMotion,
  loadMotionFeatures,
} from "@/lib/motion";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    // After initial render, enable animations for subsequent navigations
    setIsInitialLoad(false);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  const initialMotion = isInitialLoad
    ? false
    : prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20 };

  const animateMotion = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Mobile Sidebar */}
        <AnimatePresence mode="wait">
          {isMobileSidebarOpen && (
            <AdminSidebar
              isMobileOpen={true}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Bars3Icon className="w-6 h-6" />
                </Button>

                {/* Breadcrumb or Page Title */}
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-foreground">
                    Dashboard
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Welcome back, Admin
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <BellIcon className="w-5 h-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    3
                  </Badge>
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content - Optimized animations */}
          <main className="flex-1 p-4 lg:p-8">
            <motion.div
              key={pathname}
              initial={initialMotion}
              animate={animateMotion}
              transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border py-4 px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                © 2025 Santa Maria Municipal Government. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Support
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </LazyMotion>
  );
}
