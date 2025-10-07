"use client";

import { motion, AnimatePresence } from "@/lib/motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  show,
  onUndo,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="bg-card border border-border rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-foreground font-medium flex-1">{message}</p>

            <div className="flex items-center gap-2">
              {onUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUndo();
                    onClose();
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  Undo
                </Button>
              )}

              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close notification"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
