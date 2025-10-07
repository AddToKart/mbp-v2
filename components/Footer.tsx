"use client";

import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t-2 border-border py-16 px-4 sm:px-6 lg:px-8 theme-transition">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="heading-sm mb-4 text-text-primary">Santa Maria Municipal</h3>
            <p className="body-md text-text-secondary">
              Serving our community with transparency, dedication, and excellence since 1950.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-semibold text-lg mb-4 text-text-primary">Quick Links</h4>
            <ul className="space-y-2">
              {["About Us", "Services", "Transparency Portal", "Contact", "FAQs"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-text-secondary hover:text-primary smooth-transition body-md">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold text-lg mb-4 text-text-primary">Categories</h4>
            <ul className="space-y-2">
              {["Announcements", "Events", "Public Services", "Community", "Reports"].map((category) => (
                <li key={category}>
                  <a href="#" className="text-text-secondary hover:text-primary smooth-transition body-md">
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold text-lg mb-4 text-text-primary">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-text-secondary">
                <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-1" />
                <span className="body-md">
                  123 Municipal Drive, Santa Maria, CA 93454
                </span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <PhoneIcon className="w-5 h-5 flex-shrink-0" />
                <span className="body-md">(805) 925-0951</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <EnvelopeIcon className="w-5 h-5 flex-shrink-0" />
                <span className="body-md">info@santamaria.gov</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-text-secondary body-sm">
            © {currentYear} Santa Maria Municipal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-text-secondary hover:text-primary smooth-transition body-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-text-secondary hover:text-primary smooth-transition body-sm">
              Terms of Service
            </a>
            <a href="#" className="text-text-secondary hover:text-primary smooth-transition body-sm">
              Accessibility
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}