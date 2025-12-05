"use client";

import { memo, useCallback, useMemo } from "react";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  MegaphoneIcon,
  ArrowLeftOnRectangleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import ThemeSelector from "@/components/ThemeSelector";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainLinks: SidebarLink[] = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Posts", href: "/admin/posts", icon: DocumentTextIcon, badge: "12" },
  { name: "Announcements", href: "/admin/announcements", icon: MegaphoneIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
];

const settingsLinks: SidebarLink[] = [
  { name: "Categories", href: "/admin/categories", icon: Squares2X2Icon },
  { name: "Settings", href: "/admin/settings", icon: CogIcon },
];

function AdminSidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = useMemo(() => {
    if (!user?.name) {
      return "AU";
    }
    const parts = user.name.split(" ");
    const first = parts[0]?.[0];
    const second = parts[1]?.[0];
    return [first, second].filter(Boolean).join("").toUpperCase();
  }, [user?.name]);

  const handleLogout = useCallback(() => {
    logout();
    onClose?.();
  }, [logout, onClose]);

  const NavLink = memo(({ link }: { link: SidebarLink }) => {
    const isActive = pathname === link.href;
    const Icon = link.icon;

    return (
      <Link href={link.href} onClick={onClose}>
        <motion.div
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer group",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          whileHover={{ x: 4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={cn(
                "w-5 h-5 transition-transform",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}
            />
            <span className="text-sm">{link.name}</span>
          </div>
          {link.badge && (
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className="text-xs h-5 px-2"
            >
              {link.badge}
            </Badge>
          )}
        </motion.div>
      </Link>
    );
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <div>
              <h1 className="font-bold text-base text-foreground">
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">Santa Maria</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-4 mb-2">
            MAIN MENU
          </p>
          {mainLinks.map((link) => (
            <NavLink key={link.href} link={link} />
          ))}
        </div>

        <Separator />

        {/* Settings */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-4 mb-2">
            MANAGEMENT
          </p>
          {settingsLinks.map((link) => (
            <NavLink key={link.href} link={link} />
          ))}
        </div>

        <Separator />

        {/* Theme Selector */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-4 mb-2">
            APPEARANCE
          </p>
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Theme</span>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {initials || "AU"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.name ?? "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? "admin@example.com"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  // Mobile Sidebar
  if (isMobileOpen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sidebar */}
        <motion.aside
          className="absolute left-0 top-0 bottom-0 w-72"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 20 }}
        >
          {sidebarContent}
        </motion.aside>
      </motion.div>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="hidden lg:block w-72 h-screen sticky top-0">
      {sidebarContent}
    </aside>
  );
}

export default memo(AdminSidebar);
