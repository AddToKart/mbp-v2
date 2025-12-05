"use client";

import { memo } from "react";
import { motion } from "@/lib/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  trend?: "up" | "down";
}

function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconColor = "bg-primary",
  trend,
}: StatCardProps) {
  const isPositive = trend === "up" || (change && change > 0);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {change !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isPositive
                        ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(change)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {changeLabel}
                  </span>
                </div>
              )}
            </div>

            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                iconColor
              )}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default memo(StatCard);
