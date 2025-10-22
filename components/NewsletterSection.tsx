"use client";

import { motion, AnimatePresence } from "@/lib/motion";
import {
  EnvelopeIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NewsletterSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-surface/80 p-8 sm:p-12 shadow-xl backdrop-blur-xl dark:border-border/40 dark:bg-surface/55"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Elements - Subtle */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-4 bg-primary/10 rounded-2xl dark:bg-primary/20">
                <BellAlertIcon className="w-12 h-12 text-primary dark:text-primary-light" />
              </div>
            </motion.div>

            <motion.h2
              className="heading-lg text-foreground text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Stay Informed
            </motion.h2>

            <motion.p
              className="body-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Subscribe to our newsletter and never miss important updates,
              events, and announcements from Santa Maria Municipal.
            </motion.p>

            <motion.form
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onSubmit={handleSubmit}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    className="flex items-center justify-center gap-3 w-full h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Successfully subscribed!
                    </span>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex-1 relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 h-12 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary dark:bg-background/60 dark:border-border/60"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <motion.div
                      whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary-dark rounded-full shadow-lg font-semibold relative overflow-hidden"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="opacity-0">Subscribe</span>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.form>

            <motion.p
              className="text-muted-foreground text-center mt-4 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              We respect your privacy. Unsubscribe at any time.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
