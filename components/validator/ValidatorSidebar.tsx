"use client";

import { memo, useCallback, useMemo } from "react";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardDocumentCheckIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
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
  {
    name: "Dashboard",
    href: "/validator/dashboard",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    name: "History",
    href: "/validator/history",
    icon: ClockIcon,
  },
];

function ValidatorSidebar({
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
      return "VP";
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

  NavLink.displayName = "NavLink";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">SM</span>
        </div>
        <div>
          <h1 className="font-bold text-foreground text-lg">
            Validator Portal
          </h1>
          <p className="text-xs text-muted-foreground">Santa Maria</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Main Menu
        </p>
        {mainLinks.map((link) => (
          <NavLink key={link.href} link={link} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.name || "Validator"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "validator@santamaria.gov.ph"}
            </p>
          </div>
          <ThemeSelector />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={handleLogout}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (isMobileOpen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 lg:hidden bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent />
        </motion.aside>
      </motion.div>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border sticky top-0 h-screen">
      <SidebarContent />
    </aside>
  );
}

export default ValidatorSidebar;
