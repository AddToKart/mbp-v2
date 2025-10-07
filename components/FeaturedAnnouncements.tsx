"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getAllAnnouncements } from "@/lib/announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedImage from "@/components/OptimizedImage";
import { useRef } from "react";

const announcements = getAllAnnouncements().slice(0, 3);

// Animation variants for stagger effect
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

const displayAnnouncements = [
  {
    id: 1,
    title: "Community Town Hall Meeting - January 2025",
    excerpt:
      "Join us for an important discussion on upcoming infrastructure projects and community development initiatives.",
    image:
      "https://images.unsplash.com/photo-1555069855-e580a9adbf43?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBtZWV0aW5nJTIwdG93biUyMGhhbGwlMjBwZW9wbGUlMjBkaXNjdXNzaW9ufGVufDB8MHx8fDE3NTk4MzkzNTR8MA&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "January 15, 2025",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "New Public Transportation Routes Announced",
    excerpt:
      "Expanding our public transit system to better serve all neighborhoods with improved accessibility and frequency.",
    image:
      "https://images.unsplash.com/photo-1610932975716-df20896edfe5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxwdWJsaWMlMjBzZXJ2aWNlJTIwaW5mcmFzdHJ1Y3R1cmUlMjBjb21tdW5pdHklMjBkZXZlbG9wbWVudHxlbnwwfDB8fHwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "January 12, 2025",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Annual Cultural Festival Returns This Spring",
    excerpt:
      "Celebrate our diverse community with music, food, and cultural performances from around the world.",
    image:
      "https://images.unsplash.com/photo-1758388536193-affe81d27c9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxsb2NhbCUyMGV2ZW50JTIwZmVzdGl2YWwlMjBjb21tdW5pdHklMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "January 10, 2025",
    readTime: "3 min read",
  },
];

export default function FeaturedAnnouncements() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          style={{ y }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg text-foreground mb-4">
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
          {displayAnnouncements.map((announcement, index) => (
            <Link
              key={announcement.id}
              href={`/announcement/${announcement.id}`}
            >
              <motion.div
                className="group cursor-pointer h-full"
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-2xl smooth-transition border-border h-full">
                  <div className="relative h-56 overflow-hidden">
                    <OptimizedImage
                      src={announcement.image}
                      alt={announcement.title}
                      priority={index === 0}
                      enableHover={true}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {announcement.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-6">
                    <h3 className="heading-sm text-foreground mb-3 group-hover:text-primary smooth-transition">
                      {announcement.title}
                    </h3>
                    <p className="body-md text-muted-foreground mb-4">
                      {announcement.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-muted-foreground body-sm">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{announcement.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{announcement.readTime}</span>
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
