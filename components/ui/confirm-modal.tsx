"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: ExclamationTriangleIcon,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    confirmButton: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    confirmButton: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  info: {
    icon: InformationCircleIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  success: {
    icon: CheckCircleIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    confirmButton: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const config = variantConfig[variant];
  const Icon = config.icon;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button by default (safer action)
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [isLoading, onClose]
  );

  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Let the parent handle errors
      console.error("Confirm action failed:", error);
    }
  }, [onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-message"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div
                className={cn(
                  "mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4",
                  config.iconBg
                )}
              >
                <Icon className={cn("w-7 h-7", config.iconColor)} />
              </div>

              {/* Title */}
              <h2
                id="modal-title"
                className="text-xl font-semibold text-foreground text-center mb-2"
              >
                {title}
              </h2>

              {/* Message */}
              <p
                id="modal-message"
                className="text-muted-foreground text-center mb-6"
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {cancelText}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn("min-w-[100px]", config.confirmButton)}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easier usage
import { useState } from "react";

interface UseConfirmModalOptions {
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
}

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<UseConfirmModalOptions | null>(null);

  const confirm = useCallback(
    (opts: UseConfirmModalOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions({
          ...opts,
          onConfirm: async () => {
            setIsLoading(true);
            try {
              await opts.onConfirm();
              resolve(true);
              setIsOpen(false);
            } catch (error) {
              resolve(false);
              throw error;
            } finally {
              setIsLoading(false);
            }
          },
        });
        setIsOpen(true);
      });
    },
    []
  );

  const close = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false);
    }
  }, [isLoading]);

  const ConfirmModalComponent = options ? (
    <ConfirmModal
      isOpen={isOpen}
      onClose={close}
      onConfirm={options.onConfirm}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      isLoading={isLoading}
    />
  ) : null;

  return { confirm, ConfirmModal: ConfirmModalComponent };
}
