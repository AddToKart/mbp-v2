"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-3",
};

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  message = "Loading...",
  fullScreen = false,
}: LoadingOverlayProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50"
    : "absolute inset-0 z-10";

  return (
    <div
      className={cn(
        containerClass,
        "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
      )}
    >
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function LoadingButton({
  isLoading,
  children,
  loadingText,
  className,
  disabled,
  onClick,
  type = "button",
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors",
        className
      )}
    >
      {isLoading && (
        <LoadingSpinner
          size="sm"
          className="border-white border-t-transparent"
        />
      )}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}

export default LoadingSpinner;
