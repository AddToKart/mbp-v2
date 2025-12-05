"use client";

import { useState, useEffect, useCallback } from "react";

interface UseOnlineStatusOptions {
  /**
   * Ping URL to verify actual connectivity (optional)
   * If not provided, only navigator.onLine is used
   */
  pingUrl?: string;
  /**
   * Interval in ms to check connectivity when offline
   */
  checkInterval?: number;
}

/**
 * Hook to detect online/offline status with optional ping verification
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { pingUrl, checkInterval = 5000 } = options;

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isChecking, setIsChecking] = useState(false);

  const checkConnectivity = useCallback(async () => {
    if (!pingUrl) {
      setIsOnline(navigator.onLine);
      return navigator.onLine;
    }

    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(pingUrl, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [pingUrl]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pingUrl) {
        checkConnectivity();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    checkConnectivity();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnectivity, pingUrl]);

  // Periodic check when offline to detect reconnection
  useEffect(() => {
    if (isOnline || !checkInterval) return;

    const intervalId = setInterval(() => {
      checkConnectivity();
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [isOnline, checkInterval, checkConnectivity]);

  return { isOnline, isChecking, checkConnectivity };
}

/**
 * Hook to show a message when user goes offline
 */
export function useOfflineMessage() {
  const { isOnline } = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return { isOnline, showReconnected };
}

export default useOnlineStatus;
