"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getAllAnnouncements } from "@/lib/announcements";

const announcements = getAllAnnouncements().slice(0, 3);

const displayAnnouncements = [
  {
    id: 1,
    title: "Community Town Hall Meeting - January 2025",
    excerpt: "Join us for an important discussion on upcoming infrastructure projects and community development initiatives.",
    image: "https://images.unsplash.com/photo-1555069855-e580a9adbf43?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBtZWV0aW5nJTIwdG93biUyMGhhbGwlMjBwZW9wbGUlMjBkaXNjdXNzaW9ufGVufDB8MHx8fDE3NTk4MzkzNTR8MA&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "January 15, 2025",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "New Public Transportation Routes Announced",
    excerpt: "Expanding our public transit system to better serve all neighborhoods with improved accessibility and frequency.",
    image: "https://images.unsplash.com/photo-1610932975716-df20896edfe5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxwdWJsaWMlMjBzZXJ2aWNlJTIwaW5mcmFzdHJ1Y3R1cmUlMjBjb21tdW5pdHklMjBkZXZlbG9wbWVudHxlbnwwfDB8fHwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "January 12, 2025",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Annual Cultural Festival Returns This Spring",
    excerpt: "Celebrate our diverse community with music, food, and cultural performances from around the world.",
    image: "https://images.unsplash.com/photo-1758388536193-affe81d27c9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxsb2NhbCUyMGV2ZW50JTIwZmVzdGl2YWwlMjBjb21tdW5pdHklMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Events",
    date: "January 10, 2025",
    readTime: "3 min read",
  },
];

export default function FeaturedAnnouncements() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg text-text-primary mb-4">
            Featured Announcements
          </h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Stay informed with our most important updates and initiatives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayAnnouncements.map((announcement, index) => (
            <Link key={announcement.id} href={`/announcement/${announcement.id}`}>
              <motion.div
                className="group cursor-pointer h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="bg-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl smooth-transition border border-border">
                <div className="relative h-56 overflow-hidden">
                  <motion.img
                    src={announcement.image}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold">
                      {announcement.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-surface">
                  <h3 className="heading-sm text-text-primary mb-3 group-hover:text-primary smooth-transition">
                    {announcement.title}
                  </h3>
                  <p className="body-md text-text-secondary mb-4">
                    {announcement.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-text-secondary body-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{announcement.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{announcement.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}