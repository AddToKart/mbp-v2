"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    UserIcon,
    BookmarkIcon,
    UserGroupIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import {
    HomeIcon as HomeIconSolid,
    UserIcon as UserIconSolid,
    BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarLink {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    iconSolid: React.ComponentType<{ className?: string }>;
    color: string;
    glowColor: string;
}

const mainLinks: SidebarLink[] = [
    {
        name: "News Feed",
        href: "/community",
        icon: HomeIcon,
        iconSolid: HomeIconSolid,
        color: "from-blue-500 to-cyan-500",
        glowColor: "shadow-blue-500/40",
    },
    {
        name: "My Profile",
        href: "/community/profile",
        icon: UserIcon,
        iconSolid: UserIconSolid,
        color: "from-violet-500 to-purple-500",
        glowColor: "shadow-violet-500/40",
    },
    {
        name: "Saved Posts",
        href: "/community/saved",
        icon: BookmarkIcon,
        iconSolid: BookmarkIconSolid,
        color: "from-amber-500 to-orange-500",
        glowColor: "shadow-amber-500/40",
    },
];

function CommunitySidebar({
    isMobileOpen,
    onClose,
}: {
    isMobileOpen?: boolean;
    onClose?: () => void;
}) {
    const pathname = usePathname();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const NavLink = memo(({ link, index }: { link: SidebarLink; index: number }) => {
        const isActive = pathname === link.href;
        const isHovered = hoveredLink === link.href;
        const Icon = isActive || isHovered ? link.iconSolid : link.icon;

        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={link.href}>
                            <motion.div
                                className={cn(
                                    "relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer overflow-hidden",
                                    "transition-all duration-300 ease-out",
                                    isActive
                                        ? `bg-gradient-to-br ${link.color} text-white shadow-lg ${link.glowColor}`
                                        : "text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background/80"
                                )}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.3 + index * 0.1,
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 20
                                }}
                                whileHover={{
                                    scale: 1.15,
                                    rotate: [0, -5, 5, 0],
                                    transition: { rotate: { duration: 0.4 } }
                                }}
                                whileTap={{ scale: 0.9 }}
                                onHoverStart={() => setHoveredLink(link.href)}
                                onHoverEnd={() => setHoveredLink(null)}
                            >
                                {/* Hover glow ring */}
                                <AnimatePresence>
                                    {isHovered && !isActive && (
                                        <motion.div
                                            className={cn(
                                                "absolute inset-0 rounded-full bg-gradient-to-br opacity-20",
                                                link.color
                                            )}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 0.25 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Active indicator ring */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBubbleRing"
                                        className="absolute inset-0 rounded-full ring-2 ring-white/30"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                {/* Icon with animated transition */}
                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                        rotate: isActive ? [0, 10, -10, 0] : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5 transition-all duration-200",
                                        isActive && "drop-shadow-lg"
                                    )} />
                                </motion.div>

                                {/* Sparkle effect for active */}
                                {isActive && (
                                    <motion.div
                                        className="absolute -top-1 -right-1 z-10"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    >
                                        <SparklesIcon className="w-3 h-3 text-white/80" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        sideOffset={12}
                        className={cn(
                            "px-3 py-2 font-semibold text-sm rounded-xl border-0",
                            "bg-gradient-to-r shadow-lg",
                            link.color,
                            "text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <link.iconSolid className="w-4 h-4" />
                            {link.name}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    });

    NavLink.displayName = "NavLink";

    return (
        <motion.nav
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20
            }}
            className={cn(
                "sticky bottom-8 left-0 ml-4 z-50",
                "flex flex-col items-center gap-2 p-3",
                "bg-gradient-to-b from-card/80 to-card/60",
                "backdrop-blur-2xl backdrop-saturate-150",
                "border border-white/20 dark:border-white/10",
                "shadow-2xl shadow-black/10 dark:shadow-black/30",
                "rounded-[28px] w-fit",
                "before:absolute before:inset-0 before:rounded-[28px]",
                "before:bg-gradient-to-b before:from-white/10 before:to-transparent",
                "before:pointer-events-none"
            )}
        >
            {/* Brand Icon with animated gradient */}
            <motion.div
                className={cn(
                    "relative w-14 h-14 rounded-full",
                    "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
                    "flex items-center justify-center",
                    "shadow-lg shadow-purple-500/30",
                    "mb-2 overflow-hidden"
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Animated gradient overlay */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-0"
                    animate={{
                        opacity: [0, 0.5, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Pulse ring effect */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <UserGroupIcon className="w-7 h-7 text-white relative z-10 drop-shadow-md" />
            </motion.div>

            {/* Divider line */}
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-border to-transparent mb-1" />

            {/* Navigation Links */}
            {mainLinks.map((link, index) => (
                <NavLink key={link.href} link={link} index={index} />
            ))}
        </motion.nav>
    );
}

export default CommunitySidebar;
