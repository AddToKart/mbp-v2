"use client";

import { motion, AnimatePresence } from "@/lib/motion";
import { WifiIcon, SignalSlashIcon } from "@heroicons/react/24/outline";
import { useOfflineMessage } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const { isOnline, showReconnected } = useOfflineMessage();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-yellow-500 text-yellow-900 overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
            <SignalSlashIcon className="w-4 h-4" />
            <span>You're offline. Some features may be unavailable.</span>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-green-500 text-white overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
            <WifiIcon className="w-4 h-4" />
            <span>You're back online!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineBanner;
