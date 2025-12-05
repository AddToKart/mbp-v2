"use client";

import { motion } from "@/lib/motion";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8 bg-card shadow-md border-b border-border"
      aria-label="Search section"
    >
      <div className="max-w-4xl mx-auto">
        <motion.form
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Search Input */}
          <div className="flex-1 relative">
            <label htmlFor="search-input" className="sr-only">
              Search announcements
            </label>
            <MagnifyingGlassIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10"
              aria-hidden="true"
            />
            <Input
              id="search-input"
              type="search"
              placeholder="Search announcements, updates, and more..."
              className="w-full pl-12 pr-4 h-12 rounded-full text-base"
              aria-describedby="search-hint"
            />
            <span id="search-hint" className="sr-only">
              Press Enter to search or use the filters button for advanced
              options
            </span>
          </div>

          {/* Filter Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              size="lg"
              className="flex items-center gap-2 px-6 h-12 rounded-full shadow-lg hover:shadow-xl"
              aria-label="Open search filters"
            >
              <FunnelIcon className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}
