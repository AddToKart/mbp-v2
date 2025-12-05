import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
  helperText?: string;
}

function Input({
  className,
  type,
  id,
  error,
  label,
  helperText,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null, ariaDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        data-slot="input"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          error && "border-destructive ring-destructive/20",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export { Input };
