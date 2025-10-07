"use client";

import { motion } from "framer-motion";
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
  { name: "Public Services", icon: BuildingLibraryIcon, color: "bg-orange-500" },
  { name: "Community", icon: UserGroupIcon, color: "bg-pink-500" },
  { name: "Reports", icon: ChartBarIcon, color: "bg-teal-500" },
];

export default function CategoryNav() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-md text-text-primary mb-2">
            Browse by Category
          </h2>
          <p className="body-md text-text-secondary">
            Find what matters most to you
          </p>
        </motion.div>

        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.name}
                className="flex-shrink-0 group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center gap-3 p-6 bg-surface rounded-2xl shadow-md hover:shadow-xl smooth-transition min-w-[140px] border border-border">
                  <div className={`${category.color} p-4 rounded-xl group-hover:scale-110 smooth-transition`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-text-primary body-sm whitespace-nowrap">
                    {category.name}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}