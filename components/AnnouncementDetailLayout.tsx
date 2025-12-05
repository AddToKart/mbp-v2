"use client";

import { motion, useReducedMotion } from "@/lib/motion";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  ShareIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export interface AnnouncementDetailMeta {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
  viewCount?: number;
  author: {
    name: string;
    role: string;
  };
}

interface AnnouncementDetailLayoutProps {
  announcement: AnnouncementDetailMeta;
  children: React.ReactNode;
}

export default function AnnouncementDetailLayout({
  announcement,
  children,
}: AnnouncementDetailLayoutProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [viewCount, setViewCount] = useState(announcement.viewCount ?? 0);
  const viewRecorded = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const img = new Image();
    img.src = announcement.image;
    img.onload = () => setImageLoaded(true);
  }, [announcement.image]);

  // Record view on mount (only once per page load)
  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;

    // TODO: Pass userId when citizen auth is implemented
    // For now, tracks views by IP for guests
    const recordView = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/posts/${announcement.slug}/view`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({}),
          }
        );
        if (response.ok) {
          const result = await response.json();
          if (result?.viewCount !== undefined) {
            setViewCount(result.viewCount);
          }
        }
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    };
    recordView();
  }, [announcement.slug]);

  const handleShare = async () => {
    if (!navigator.share) {
      return;
    }

    try {
      await navigator.share({
        title: announcement.title,
        text: announcement.excerpt,
        url: window.location.href,
      });
    } catch (error) {
      // Silently ignore share cancellation
      console.debug("Share action was cancelled or failed", error);
    }
  };

  const entryInitial = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 0, y: 16, scale: 0.97 };
  const entryAnimate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-background"
      initial={entryInitial}
      animate={entryAnimate}
      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ willChange: "transform, opacity" }}
        >
          <Link href="/">
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary smooth-transition mb-8">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
          </Link>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold">
              {announcement.category}
            </span>
            {announcement.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-surface border border-border text-text-secondary rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <motion.h1
            className="heading-xl text-text-primary mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 0.61, 0.36, 1],
              delay: 0.06,
            }}
            style={{ willChange: "transform, opacity" }}
          >
            {announcement.title}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 text-text-secondary body-md mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>{announcement.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>{announcement.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <div>
                <span className="font-medium text-text-primary">
                  {announcement.author.name}
                </span>
                <span className="text-sm"> • {announcement.author.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-primary hover:text-white hover:border-primary smooth-transition text-text-primary"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </motion.div>

        <motion.div
          className="mb-12 rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={
            imageLoaded
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0.6, scale: 0.99, y: 8 }
          }
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <img
            src={announcement.image}
            alt={announcement.title}
            className="w-full h-[400px] object-cover"
            loading="eager"
            decoding="async"
          />
        </motion.div>

        <motion.article
          className="prose prose-lg max-w-none bg-surface rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ willChange: "transform, opacity" }}
        >
          {children}
        </motion.article>

        <motion.div
          className="mt-12 p-8 bg-primary/5 rounded-2xl border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ willChange: "transform, opacity" }}
        >
          <h3 className="heading-sm text-text-primary mb-4">Stay Connected</h3>
          <p className="body-md text-text-secondary mb-6">
            Subscribe to our newsletter to receive updates on announcements like
            this directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none smooth-transition bg-surface text-text-primary"
            />
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark smooth-transition">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
