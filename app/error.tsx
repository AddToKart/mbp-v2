"use client";

import { useEffect } from "react";
import { motion } from "@/lib/motion";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
        >
          <ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-foreground mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Something went wrong
        </motion.h1>

        <motion.p
          className="text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We apologize for the inconvenience. An unexpected error has occurred.
          Please try again or return to the home page.
        </motion.p>

        {process.env.NODE_ENV === "development" && error.message && (
          <motion.pre
            className="text-left text-xs bg-muted p-4 rounded-lg mb-6 overflow-auto max-h-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {error.message}
          </motion.pre>
        )}

        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button onClick={reset} variant="outline">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button>
              <HomeIcon className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </motion.div>

        {error.digest && (
          <motion.p
            className="mt-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Error ID: {error.digest}
          </motion.p>
        )}
      </div>
    </div>
  );
}
