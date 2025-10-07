"use client";

import { motion } from "@/lib/motion";
import {
  UserGroupIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    icon: UserGroupIcon,
    value: "150K+",
    label: "Citizens Served",
    color: "bg-blue-500",
  },
  {
    icon: DocumentTextIcon,
    value: "500+",
    label: "Announcements Published",
    color: "bg-green-500",
  },
  {
    icon: CalendarDaysIcon,
    value: "200+",
    label: "Community Events",
    color: "bg-purple-500",
  },
  {
    icon: BuildingLibraryIcon,
    value: "50+",
    label: "Public Services",
    color: "bg-orange-500",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden theme-transition">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg text-white mb-4">Serving Our Community</h2>
          <p className="body-lg text-white/90 max-w-2xl mx-auto">
            Committed to transparency, excellence, and community engagement
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`${stat.color} p-4 rounded-2xl`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <motion.h3
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
