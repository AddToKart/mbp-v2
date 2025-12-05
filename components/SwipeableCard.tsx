"use client";

import { motion, useMotionValue, useTransform } from "@/lib/motion";
import type { PanInfo } from "framer-motion";
import { useState } from "react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDismiss: () => void;
  disabled?: boolean; // Disable swipe for critical announcements
  className?: string;
}

const SWIPE_THRESHOLD = 100; // Pixels to trigger dismiss
const SWIPE_POWER = 200; // Exit velocity threshold

export default function SwipeableCard({
  children,
  onDismiss,
  disabled = false,
  className = "",
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);

  // Rotate card slightly based on drag distance
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);

  // Fade out as card is dragged
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 0.8, 1, 0.8, 0.5]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);

    const swipeVelocity = Math.abs(info.velocity.x);
    const swipeDistance = Math.abs(info.offset.x);

    // Dismiss if swiped fast enough OR far enough
    if (swipeVelocity > SWIPE_POWER || swipeDistance > SWIPE_THRESHOLD) {
      onDismiss();
    }
  };

  if (disabled) {
    // Critical announcements don't have swipe functionality
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
      whileTap={{ cursor: "grabbing" }}
      animate={{
        x: 0,
        rotate: 0,
        opacity: 1,
      }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Drag indicator hint on mobile */}
      {!isDragging && (
        <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-20 pointer-events-none md:hidden">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
          </div>
        </div>
      )}

      {children}
    </motion.div>
  );
}
