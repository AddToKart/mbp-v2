"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

interface RoleBadgeProps {
    role: "admin" | "validator" | "citizen";
    size?: "sm" | "md";
    showIcon?: boolean;
}

/**
 * Role Badge Component
 * 
 * Displays a badge indicating user role (Admin, Validator, or nothing for citizens).
 * Use this in community posts, comments, and user profiles.
 * 
 * @example
 * // In a post card
 * <div className="flex items-center gap-2">
 *   <span>{author.name}</span>
 *   <RoleBadge role={author.role} size="sm" />
 * </div>
 */
export function RoleBadge({ role, size = "sm", showIcon = true }: RoleBadgeProps) {
    // Citizens don't get a badge
    if (role === "citizen") return null;

    const config = {
        admin: {
            label: "Admin",
            className: "bg-blue-600 text-white hover:bg-blue-600 border-0",
            icon: ShieldCheckIcon,
        },
        validator: {
            label: "Validator",
            className: "bg-emerald-600 text-white hover:bg-emerald-600 border-0",
            icon: CheckBadgeIcon,
        },
    };

    const { label, className, icon: Icon } = config[role];
    const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5";

    return (
        <Badge className={`${className} ${sizeClasses} font-medium gap-0.5`}>
            {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
            {label}
        </Badge>
    );
}

/**
 * Inline Role Indicator
 * 
 * Minimal version for tight spaces - just shows icon with tooltip.
 */
export function RoleIndicator({ role }: { role: "admin" | "validator" | "citizen" }) {
    if (role === "citizen") return null;

    const config = {
        admin: {
            className: "text-blue-600",
            icon: ShieldCheckIcon,
            title: "Administrator",
        },
        validator: {
            className: "text-emerald-600",
            icon: CheckBadgeIcon,
            title: "Validator",
        },
    };

    const { className, icon: Icon, title } = config[role];

    return (
        <Icon className={`w-4 h-4 ${className}`} title={title} />
    );
}
