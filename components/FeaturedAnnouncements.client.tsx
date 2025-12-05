"use client";

import { motion } from "@/lib/motion";
import Link from "next/link";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { PostSummary } from "@/lib/posts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedImage from "@/components/OptimizedImage";

import { useQuery } from "@tanstack/react-query";
import { fetchPostSummaries } from "@/lib/posts";

export default function FeaturedAnnouncementsClient() {
  const { data: posts = [] } = useQuery({
    queryKey: ["posts", "featured", 3],
    queryFn: () => fetchPostSummaries(3),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-card"
      aria-labelledby="featured-announcements-heading"
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
            id="featured-announcements-heading"
            className="heading-lg text-foreground mb-4"
          >
            Featured Announcements
          </h2>
          <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our most important updates and initiatives
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {posts.map((post, index) => (
            <Link key={post.slug} href={`/announcement/${post.slug}`} prefetch>
              <motion.div
                className="group cursor-pointer h-full"
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{
                  layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
                }}
                layoutId={`announcement-card-${post.slug}`}
              >
                <Card className="overflow-hidden hover:shadow-2xl smooth-transition border-border h-full">
                  <motion.div
                    className="relative h-56 overflow-hidden"
                    layoutId={`announcement-image-${post.slug}`}
                    transition={{
                      layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    }}
                    style={{ willChange: "transform" }}
                  >
                    <OptimizedImage
                      src={post.image}
                      alt={post.title}
                      priority={index === 0}
                      enableHover
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {post.category}
                      </Badge>
                    </div>
                  </motion.div>

                  <CardContent className="pt-6">
                    <motion.h3
                      className="heading-sm text-foreground mb-3 group-hover:text-primary smooth-transition"
                      layoutId={`announcement-title-${post.slug}`}
                      transition={{
                        layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                      }}
                    >
                      {post.title}
                    </motion.h3>
                    <p className="body-md text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-muted-foreground body-sm">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                        <time dateTime={post.date}>{post.date}</time>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" aria-hidden="true" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
