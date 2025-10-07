"use client";

import { useState, useEffect } from "react";

const DISMISSED_ANNOUNCEMENTS_KEY = "municipality_dismissed_announcements";

export function useDismissedAnnouncements() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dismissed IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load dismissed announcements:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever dismissedIds changes
  const saveDismissedIds = (ids: string[]) => {
    try {
      localStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(ids));
      setDismissedIds(ids);
    } catch (error) {
      console.error("Failed to save dismissed announcements:", error);
    }
  };

  const dismissAnnouncement = (id: string) => {
    const newDismissedIds = [...dismissedIds, id];
    saveDismissedIds(newDismissedIds);
  };

  const undoDismiss = (id: string) => {
    const newDismissedIds = dismissedIds.filter(
      (dismissedId) => dismissedId !== id
    );
    saveDismissedIds(newDismissedIds);
  };

  const clearAllDismissed = () => {
    saveDismissedIds([]);
  };

  const isDismissed = (id: string) => {
    return dismissedIds.includes(id);
  };

  return {
    dismissedIds,
    dismissAnnouncement,
    undoDismiss,
    clearAllDismissed,
    isDismissed,
    isLoaded, // Use this to prevent flash of dismissed content
  };
}
