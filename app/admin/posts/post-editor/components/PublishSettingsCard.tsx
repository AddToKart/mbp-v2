"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { PostStatus, RecommendedSchedule, PostFormData } from "../types";
import { motion } from "@/lib/motion";
import { formatScheduleLabel } from "../utils";

interface PublishSettingsCardProps {
  formData: PostFormData;
  onInputChange: (field: keyof PostFormData, value: string | string[]) => void;
  recommendedSchedule: RecommendedSchedule | null;
  onApplySuggestedSchedule: () => void;
}

/**
 * Publish settings card component
 */
export function PublishSettingsCard({
  formData,
  onInputChange,
  recommendedSchedule,
  onApplySuggestedSchedule,
}: PublishSettingsCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Publish Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: "draft",
                label: "Draft",
                icon: DocumentTextIcon,
                activeClass:
                  "bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600",
              },
              {
                value: "published",
                label: "Publish",
                icon: CheckCircleIcon,
                activeClass:
                  "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md dark:bg-emerald-600 dark:text-white dark:border-emerald-500",
              },
              {
                value: "scheduled",
                label: "Schedule",
                icon: ClockIcon,
                activeClass:
                  "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md dark:bg-blue-600 dark:text-white dark:border-blue-500",
              },
            ].map((status) => (
              <Button
                key={status.value}
                variant="outline"
                size="sm"
                onClick={() =>
                  onInputChange("status", status.value as PostStatus)
                }
                className={`flex flex-col items-center gap-1 h-auto py-3 transition-all duration-200 ${
                  formData.status === status.value
                    ? `${status.activeClass} border-2 shadow-sm`
                    : "text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
                }`}
              >
                <status.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{status.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {recommendedSchedule && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <ClockIcon className="w-4 h-4" /> Smart schedule suggestion
            </div>
            <p className="text-sm text-foreground">
              Next best slot: {recommendedSchedule.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {recommendedSchedule.rationale}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={onApplySuggestedSchedule}
            >
              Use Suggested Slot
            </Button>
          </div>
        )}

        {formData.status === "scheduled" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2"
          >
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Schedule Date
              </label>
              <Input
                type="date"
                value={formData.scheduledDate ?? ""}
                onChange={(e) => onInputChange("scheduledDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Schedule Time
              </label>
              <Input
                type="time"
                value={formData.scheduledTime ?? ""}
                onChange={(e) => onInputChange("scheduledTime", e.target.value)}
              />
            </div>
            {formatScheduleLabel(
              formData.scheduledDate,
              formData.scheduledTime
            ) && (
              <p className="text-xs text-muted-foreground">
                Preview:{" "}
                {formatScheduleLabel(
                  formData.scheduledDate,
                  formData.scheduledTime
                )}
              </p>
            )}
          </motion.div>
        )}

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Author
          </label>
          <Input
            value={formData.author}
            onChange={(e) => onInputChange("author", e.target.value)}
            disabled
            className="bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
}
