"use client";

import { motion } from "@/lib/motion";
import { Card, CardContent } from "@/components/ui/card";

export default function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-border h-full">
      {/* Image skeleton with shimmer */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer" />

      <CardContent className="pt-6 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer rounded w-3/4" />

        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer rounded w-full" />
          <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer rounded w-5/6" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex gap-4 pt-4">
          <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer rounded w-20" />
          <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer rounded w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </motion.div>
  );
}
