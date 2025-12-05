"use client";

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Skip link component for keyboard users to skip to main content
 * Only visible when focused
 */
export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
        "transition-all",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Visually hidden content that remains accessible to screen readers
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
}: {
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return <Component className="sr-only">{children}</Component>;
}

/**
 * Live region for announcing dynamic content changes to screen readers
 */
export function LiveRegion({
  children,
  mode = "polite",
  atomic = true,
  className,
}: {
  children: React.ReactNode;
  mode?: "polite" | "assertive" | "off";
  atomic?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
}

export default SkipLink;
