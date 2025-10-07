"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { getAllAnnouncements } from "@/lib/announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";

const allAnnouncements = getAllAnnouncements().slice(0, 3);

const blogPosts = [
  {
    id: 1,
    title: "Urban Development Plan 2025-2030",
    excerpt:
      "Comprehensive overview of our city's growth strategy focusing on sustainable infrastructure and smart city initiatives.",
    image:
      "https://images.unsplash.com/photo-1758304480874-253e82fc6418?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxjaXR5JTIwcGxhbm5pbmclMjB1cmJhbiUyMGRldmVsb3BtZW50JTIwYWVyaWFsJTIwY2l0eSUyMHZpZXd8ZW58MHwwfHx8MTc1OTgzOTM1NHww&ixlib=rb-4.1.0&q=85",
    category: "Transparency",
    date: "January 8, 2025",
    readTime: "8 min read",
  },
  {
    id: 2,
    title: "Green Spaces Initiative Launch",
    excerpt:
      "New parks and recreational areas to enhance community wellness and environmental sustainability.",
    image:
      "https://images.unsplash.com/photo-1604287285211-148c4be92d12?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxlbnZpcm9ubWVudGFsJTIwc3VzdGFpbmFiaWxpdHklMjBncmVlbiUyMHNwYWNlcyUyMHVyYmFuJTIwcGFya3N8ZW58MHwwfHxncmVlbnwxNzU5ODM5MzU0fDA&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "January 6, 2025",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Public Transit Expansion Update",
    excerpt:
      "Progress report on new bus routes and improved service frequency across all districts.",
    image:
      "https://images.unsplash.com/photo-1601247173792-b282c350cabc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw1fHxwdWJsaWMlMjB0cmFuc3BvcnRhdGlvbiUyMGJ1c2VzJTIwdHJhbnNpdCUyMGluZnJhc3RydWN0dXJlfGVufDB8MHx8fDE3NTk4MzkzNTd8MA&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "January 4, 2025",
    readTime: "5 min read",
  },
  {
    id: 4,
    title: "Education Excellence Program",
    excerpt:
      "Investing in our future with enhanced educational facilities and innovative learning programs.",
    image:
      "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBzY2hvb2wlMjBzdHVkZW50cyUyMGxlYXJuaW5nfGVufDB8MHx8fDE3NTk4MzkzNTh8MA&ixlib=rb-4.1.0&q=85",
    category: "Reports",
    date: "January 2, 2025",
    readTime: "7 min read",
  },
  {
    id: 5,
    title: "Healthcare Access Improvements",
    excerpt:
      "Expanding medical services and facilities to ensure quality healthcare for all residents.",
    image:
      "https://images.unsplash.com/photo-1710074213379-2a9c2653046a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMGZhY2lsaXRpZXMlMjBob3NwaXRhbHxlbnwwfDB8fHwxNzU5ODM5MzU4fDA&ixlib=rb-4.1.0&q=85",
    category: "Public Services",
    date: "December 30, 2024",
    readTime: "6 min read",
  },
  {
    id: 6,
    title: "Local Business Support Program",
    excerpt:
      "New initiatives to boost local economy and support small businesses in our community.",
    image:
      "https://images.unsplash.com/photo-1758346973678-0d027b70d14f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGJ1c2luZXNzJTIwbWFya2V0JTIwY29tbWVyY2V8ZW58MHwwfHx8MTc1OTgzOTM1OHww&ixlib=rb-4.1.0&q=85",
    category: "Community Updates",
    date: "December 28, 2024",
    readTime: "5 min read",
  },
];

// Animation variants for stagger effect
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

export default function BlogGrid() {
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

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {allAnnouncements.map((post, index) => (
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
