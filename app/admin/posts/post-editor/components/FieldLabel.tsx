"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface FieldLabelProps {
  children: React.ReactNode;
  tooltip: string;
  required?: boolean;
}

/**
 * Helper component for labels with helpful tooltips
 */
export function FieldLabel({
  children,
  tooltip,
  required = false,
}: FieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-sm font-semibold text-foreground">
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <Tooltip>
        <TooltipTrigger
          className="text-muted-foreground hover:text-foreground transition-colors cursor-help"
          aria-label="More info"
        >
          <QuestionMarkCircleIcon className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
