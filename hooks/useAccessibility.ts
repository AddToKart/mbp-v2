"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook to trap focus within a container (for modals, dialogs, etc.)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when trap activates
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to manage focus when a component mounts/unmounts
 * Restores focus to the previously focused element on unmount
 */
export function useFocusReturn(shouldRestore: boolean = true) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldRestore) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (shouldRestore && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [shouldRestore]);
}

/**
 * Hook for skip link functionality
 */
export function useSkipLink() {
  const mainContentRef = useRef<HTMLElement>(null);

  const skipToContent = useCallback(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      mainContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return { mainContentRef, skipToContent };
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", priority);
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = message;

      document.body.appendChild(announcement);

      // Remove after announcement is made
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  return announce;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to manage roving tabindex for keyboard navigation in lists/grids
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: "horizontal" | "vertical" | "both";
    loop?: boolean;
  } = {}
) {
  const { orientation = "vertical", loop = true } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        ArrowUp: orientation !== "horizontal" ? -1 : 0,
        ArrowDown: orientation !== "horizontal" ? 1 : 0,
        ArrowLeft: orientation !== "vertical" ? -1 : 0,
        ArrowRight: orientation !== "vertical" ? 1 : 0,
        Home: -Infinity,
        End: Infinity,
      };

      const delta = keyMap[e.key];
      if (delta === undefined) return;

      e.preventDefault();

      let newIndex: number;
      if (delta === -Infinity) {
        newIndex = 0;
      } else if (delta === Infinity) {
        newIndex = items.length - 1;
      } else {
        newIndex = activeIndex + delta;
        if (loop) {
          newIndex = (newIndex + items.length) % items.length;
        } else {
          newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        }
      }

      setActiveIndex(newIndex);
      items[newIndex]?.focus();
    },
    [activeIndex, items, loop, orientation]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}

/**
 * Generates a unique ID for accessibility attributes
 */
let idCounter = 0;
export function useId(prefix: string = "a11y"): string {
  const [id] = useState(() => `${prefix}-${++idCounter}`);
  return id;
}
