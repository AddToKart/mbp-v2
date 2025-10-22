"use client";

import { motion, AnimatePresence } from "@/lib/motion";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import type { Announcement } from "@/lib/announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";
import { useMemo, useState, useCallback } from "react";
import { useDismissedAnnouncements } from "@/hooks/useDismissedAnnouncements";
import SwipeableCard from "@/components/SwipeableCard";
import Toast from "@/components/Toast";

interface BlogGridClientProps {
  announcements: Announcement[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function BlogGridClient({ announcements }: BlogGridClientProps) {
  const [showToast, setShowToast] = useState(false);
  const [lastDismissedId, setLastDismissedId] = useState<string | null>(null);

  const { dismissedIds, dismissAnnouncement, undoDismiss, isLoaded } =
    useDismissedAnnouncements();

  const handleDismiss = useCallback(
    (postId: string) => {
      dismissAnnouncement(postId);
      setLastDismissedId(postId);
      setShowToast(true);
    },
    [dismissAnnouncement]
  );

  const handleUndo = useCallback(() => {
    if (lastDismissedId) {
      undoDismiss(lastDismissedId);
      setLastDismissedId(null);
    }
  }, [lastDismissedId, undoDismiss]);

  const visiblePosts = useMemo(
    () =>
      announcements.filter(
        (post) => !dismissedIds.includes(post.id.toString())
      ),
    [announcements, dismissedIds]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg text-text-primary mb-4">Latest Updates</h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Explore our recent posts and stay connected with what's happening in
            Santa Maria
          </p>
        </motion.div>

        <Toast
          message="Announcement dismissed"
          show={showToast}
          onUndo={handleUndo}
          onClose={() => setShowToast(false)}
        />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <AnimatePresence mode="popLayout">
            {visiblePosts.map((post, index) => {
              const isCritical =
                post.category === "Emergency" ||
                post.category === "Public Safety";

              return (
                <SwipeableCard
                  key={post.id}
                  onDismiss={() => handleDismiss(post.id.toString())}
                  disabled={isCritical}
                >
                  <Link href={`/announcement/${post.id}`} prefetch>
                    <motion.article
                      className="group cursor-pointer h-full"
                      variants={cardVariants}
                      layoutId={`announcement-card-${post.id}`}
                      transition={{
                        layout: {
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1] as const,
                        },
                      }}
                    >
                      <Card className="overflow-hidden hover:shadow-2xl smooth-transition h-full border-border">
                        <motion.div
                          className="relative h-48 overflow-hidden"
                          layoutId={`announcement-image-${post.id}`}
                          transition={{
                            layout: {
                              duration: 0.4,
                              ease: [0.4, 0, 0.2, 1],
                            },
                          }}
                          style={{ willChange: "transform" }}
                        >
                          <OptimizedImage
                            src={post.image}
                            alt={post.title}
                            priority={index === 0}
                            enableHover
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-card/90 backdrop-blur-sm text-primary border-border">
                              {post.category}
                            </Badge>
                          </div>
                        </motion.div>

                        <CardContent className="flex-1 flex flex-col pt-6">
                          <motion.h3
                            className="heading-sm text-foreground mb-3 group-hover:text-primary smooth-transition"
                            layoutId={`announcement-title-${post.id}`}
                            transition={{
                              layout: {
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1],
                              },
                            }}
                          >
                            {post.title}
                          </motion.h3>
                          <p className="body-md text-muted-foreground mb-4 flex-1">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-3 text-muted-foreground body-sm">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{post.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{post.readTime}</span>
                              </div>
                            </div>

                            <motion.div
                              className="text-primary"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ArrowRightIcon className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.article>
                  </Link>
                </SwipeableCard>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/announcements">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="px-8 rounded-full shadow-lg hover:shadow-xl"
              >
                Load More Posts
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
