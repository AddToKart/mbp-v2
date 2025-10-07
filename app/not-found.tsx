"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        </motion.div>

        <motion.h2
          className="heading-lg text-text-primary mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="body-lg text-text-secondary mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/">
            <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark smooth-transition shadow-lg hover:shadow-xl mx-auto">
              <HomeIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}