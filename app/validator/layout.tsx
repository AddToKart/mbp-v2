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
import ValidatorSidebar from "@/components/validator/ValidatorSidebar";
import { Button } from "@/components/ui/button";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

export default function ValidatorLayout({
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
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Allow admins to access validator pages too, or just validators
    if (user?.role !== "validator" && user?.role !== "admin") {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [isLoading, isAuthenticated, user, router]);

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
            Loading validator portal...
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
        <ValidatorSidebar />

        {/* Mobile Sidebar */}
        <AnimatePresence mode="wait">
          {isMobileSidebarOpen && (
            <ValidatorSidebar
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
                <h1 className="text-lg font-semibold lg:hidden">
                  Validator Portal
                </h1>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <motion.div
              key={pathname}
              initial={initialMotion}
              animate={animateMotion}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </LazyMotion>
  );
}
