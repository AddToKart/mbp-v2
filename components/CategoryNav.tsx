"use client";

import { motion, useReducedMotion } from "@/lib/motion";
import {
  DocumentTextIcon,
  MegaphoneIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const categories = [
  { name: "Transparency", icon: DocumentTextIcon, color: "bg-blue-500" },
  { name: "Announcements", icon: MegaphoneIcon, color: "bg-purple-500" },
  { name: "Events", icon: CalendarIcon, color: "bg-green-500" },
  {
    name: "Public Services",
    icon: BuildingLibraryIcon,
    color: "bg-orange-500",
  },
  { name: "Community", icon: UserGroupIcon, color: "bg-pink-500" },
  { name: "Reports", icon: ChartBarIcon, color: "bg-teal-500" },
];

const hoverDescriptions = [
  "Budget, spending, and ordinances",
  "Latest bulletins and notices",
  "Workshops, fairs, and celebrations",
  "Essential services and assistance",
  "People-focused programs",
  "Metrics, audits, and progress",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.94, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

export default function CategoryNav() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)_/_0.15),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_hsl(var(--primary)_/_0.28),_transparent_55%)]" />

      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] as const }}
        >
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground dark:border-border/40">
            Explore services
          </span>
          <h2 className="mt-6 text-4xl font-semibold text-text-primary sm:text-5xl">
            Browse by Category
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
            Find what matters most to you and discover new ways to get involved.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.name}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface/80 p-6 text-left shadow-lg backdrop-blur-xl transition-colors dark:border-border/40 dark:bg-surface/60"
                whileHover={{
                  scale: 1.03,
                  y: -6,
                  rotate: shouldReduceMotion ? 0 : 0.4,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  animate={{
                    opacity: shouldReduceMotion ? 0 : [0.2, 0.35, 0.2],
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 4,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    background:
                      "radial-gradient(120px circle at 50% 22%, hsl(var(--primary) / 0.18), transparent 70%)",
                  }}
                />
                <div className="relative flex flex-col items-center gap-4">
                  <motion.span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${category.color}`}
                    whileHover={{ scale: 1.08 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.span>
                  <span className="text-center font-semibold text-text-primary">
                    {category.name}
                  </span>
                  <span className="text-center text-sm text-muted-foreground">
                    {hoverDescriptions[index]}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
