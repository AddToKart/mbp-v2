"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import {
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { getAllAnnouncements } from "@/lib/announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const POSTS_PER_PAGE = 9;

// Animation variants for stagger effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
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

export default function AllAnnouncementsGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const allAnnouncements = getAllAnnouncements();

  const totalPages = Math.ceil(allAnnouncements.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = allAnnouncements.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="disabled:opacity-50"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </Button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          onClick={() => goToPage(1)}
          className="w-10"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          onClick={() => goToPage(i)}
          className="w-10"
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          onClick={() => goToPage(totalPages)}
          className="w-10"
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="disabled:opacity-50"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    );

    return pages;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Results count */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(endIndex, allAnnouncements.length)} of{" "}
            {allAnnouncements.length} announcements
          </p>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {currentPosts.map((post, index) => (
            <Link key={post.id} href={`/announcement/${post.id}`}>
              <motion.article
                className="group cursor-pointer h-full"
                variants={cardVariants}
              >
                <Card className="overflow-hidden hover:shadow-2xl smooth-transition h-full border-border">
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={post.image}
                      alt={post.title}
                      priority={false}
                      enableHover={true}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-card/90 backdrop-blur-sm text-primary border-border">
                        {post.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="flex-1 flex flex-col pt-6">
                    <h3 className="heading-sm text-foreground mb-3 group-hover:text-primary smooth-transition">
                      {post.title}
                    </h3>
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
          ))}
        </motion.div>

        {/* Pagination */}
        <motion.div
          className="flex justify-center items-center gap-2 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderPageNumbers()}
        </motion.div>

        {/* Page info */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
