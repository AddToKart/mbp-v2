"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    options?: {
      type?: ToastType;
      duration?: number;
      action?: { label: string; onClick: () => void };
    }
  ) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 5000;

const typeConfig: Record<
  ToastType,
  { icon: typeof CheckCircleIcon; className: string }
> = {
  success: {
    icon: CheckCircleIcon,
    className: "text-green-500 dark:text-green-400",
  },
  error: {
    icon: ExclamationCircleIcon,
    className: "text-red-500 dark:text-red-400",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: "text-yellow-500 dark:text-yellow-400",
  },
  info: {
    icon: InformationCircleIcon,
    className: "text-blue-500 dark:text-blue-400",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      options?: {
        type?: ToastType;
        duration?: number;
        action?: { label: string; onClick: () => void };
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const type = options?.type ?? "info";
      const duration = options?.duration ?? DEFAULT_DURATION;

      const toast: Toast = {
        id,
        message,
        type,
        duration,
        action: options?.action,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, dismissToast, clearAllToasts }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon: Icon, className } = typeConfig[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${className}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{toast.message}</p>
                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        onDismiss(toast.id);
                      }}
                      className="text-sm font-medium text-primary hover:text-primary/80 mt-1"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { showToast } = useToast();
  return useCallback(
    (message: string, duration?: number) =>
      showToast(message, { type: "success", duration }),
    [showToast]
  );
}

export function useErrorToast() {
  const { showToast } = useToast();
  return useCallback(
    (message: string, duration?: number) =>
      showToast(message, { type: "error", duration: duration ?? 7000 }),
    [showToast]
  );
}
