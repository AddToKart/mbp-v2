"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "@/lib/motion";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { PostSummary } from "@/lib/posts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";
import { useCallback, useMemo, useState, useRef } from "react";
import { useDismissedAnnouncements } from "@/hooks/useDismissedAnnouncements";
import SwipeableCard from "@/components/SwipeableCard";
import Toast from "@/components/Toast";

import { useQuery } from "@tanstack/react-query";
import { fetchPostSummaries } from "@/lib/posts";
import { BlogGridSkeleton } from "./BlogGridSkeleton";

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;

    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function BlogGridClient() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", "summary", 6],
    queryFn: () => fetchPostSummaries(6),
  });

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
  const [showToast, setShowToast] = useState(false);
  const [lastDismissedSlug, setLastDismissedSlug] = useState<string | null>(
    null
  );

  const { dismissedIds, dismissAnnouncement, undoDismiss, isLoaded } =
    useDismissedAnnouncements();

  const handleDismiss = useCallback(
    (slug: string) => {
      dismissAnnouncement(slug);
      setLastDismissedSlug(slug);
      setShowToast(true);
    },
    [dismissAnnouncement]
  );

  const handleUndo = useCallback(() => {
    if (lastDismissedSlug) {
      undoDismiss(lastDismissedSlug);
      setLastDismissedSlug(null);
    }
  }, [lastDismissedSlug, undoDismiss]);

  const handleToastClose = useCallback(() => {
    setShowToast(false);
    setLastDismissedSlug(null);
  }, []);

  const visiblePosts = useMemo(
    () => posts.filter((post) => !dismissedIds.includes(post.slug)),
    [posts, dismissedIds]
  );

  if (isLoading || !isLoaded) {
    return <BlogGridSkeleton />;
  }

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
      aria-labelledby="latest-updates-heading"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            id="latest-updates-heading"
            className="heading-lg text-text-primary mb-4"
          >
            Latest Updates
          </h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Explore our recent posts and stay connected with what's happening in
            Santa Maria
          </p>
        </motion.div>

        <Toast
          message="Announcement dismissed"
          show={showToast}
          onUndo={handleUndo}
          onClose={handleToastClose}
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
                  key={post.slug}
                  onDismiss={() => handleDismiss(post.slug)}
                  disabled={isCritical}
                >
                  <Link href={`/announcement/${post.slug}`} prefetch>
                    <motion.article
                      className="group cursor-pointer h-full perspective-1000"
                      variants={cardVariants}
                      layoutId={`announcement-card-${post.slug}`}
                      transition={{
                        layout: {
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1] as const,
                        },
                      }}
                    >
                      <TiltCard className="h-full">
                        <Card className="overflow-hidden hover:shadow-2xl smooth-transition h-full border-border bg-card/50 backdrop-blur-sm">
                          <motion.div
                            className="relative h-48 overflow-hidden"
                            layoutId={`announcement-image-${post.slug}`}
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
                              layoutId={`announcement-title-${post.slug}`}
                            >
                              {post.title}
                            </motion.h3>
                            <p className="body-md text-muted-foreground mb-4 flex-1">
                              {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-center gap-3 text-muted-foreground body-sm">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                  />
                                  <time dateTime={post.date}>{post.date}</time>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                  />
                                  <span>{post.readTime}</span>
                                </div>
                              </div>

                              <motion.div
                                className="text-primary"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                                aria-hidden="true"
                              >
                                <ArrowRightIcon className="w-5 h-5" />
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </TiltCard>
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
