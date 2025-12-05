"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { PolicyWarning } from "../types";

interface PolicyChecklistProps {
  policyWarnings: PolicyWarning[];
  policyScore: number;
}

/**
 * Quality checklist card showing policy warnings and score
 */
export function PolicyChecklist({
  policyWarnings,
  policyScore,
}: PolicyChecklistProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InformationCircleIcon className="w-5 h-5 text-primary" />
          Quality Checklist
        </CardTitle>
        <CardDescription>
          Make sure your post is ready before publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Quality Score
            </p>
            <p className="text-xs text-muted-foreground">
              Fix critical issues before publishing
            </p>
          </div>
          <Badge
            variant={policyWarnings.length === 0 ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {policyScore}%
          </Badge>
        </div>

        <Separator />

        {policyWarnings.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
            All quality checks look great. You're ready to publish!
          </div>
        ) : (
          <div className="space-y-3">
            {policyWarnings.map((warning) => (
              <div
                key={warning.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
              >
                <ExclamationTriangleIcon
                  className={`w-5 h-5 ${
                    warning.severity === "critical"
                      ? "text-destructive"
                      : warning.severity === "warning"
                        ? "text-amber-500"
                        : "text-sky-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {warning.message}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 text-xs ${
                      warning.severity === "critical"
                        ? "border-destructive text-destructive"
                        : warning.severity === "warning"
                          ? "border-amber-500 text-amber-600"
                          : "border-sky-500 text-sky-600"
                    }`}
                  >
                    {warning.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
