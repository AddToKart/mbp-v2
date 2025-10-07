"use client";

import { motion } from "framer-motion";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card sticky top-0 z-40 shadow-md border-b border-border">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search announcements, updates, and more..."
              className="w-full pl-12 pr-4 h-12 rounded-full text-base"
            />
          </div>

          {/* Filter Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="flex items-center gap-2 px-6 h-12 rounded-full shadow-lg hover:shadow-xl"
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
