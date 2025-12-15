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
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function CommunityLayout({
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

        if (!isAuthenticated || !user) {
            router.replace("/login?redirect=/community");
            return;
        }

        if (user.role === "citizen" && user.verificationStatus !== "approved") {
            router.replace("/");
            return;
        }

        setIsReady(true);
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">
                        Loading community...
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
            <div className="min-h-screen bg-background relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-background to-background dark:from-blue-900/10">

                {/* Main Content Area */}
                <div className="min-h-screen flex flex-col">
                    {/* Page Content with Padding for Fixed Navbar and spacing */}
                    <main className="flex-1 w-full pt-36 pb-20 px-4 md:px-8">
                        <div className="flex items-end">
                            {/* Floating Sidebar Bubble - Left side */}
                            <div className="hidden lg:block sticky bottom-8 self-end h-fit mb-4">
                                <CommunitySidebar />
                            </div>

                            <motion.div
                                key={pathname}
                                initial={initialMotion}
                                animate={animateMotion}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full max-w-[98%] mx-auto flex-1"
                            >
                                {children}
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </LazyMotion>
    );
}
