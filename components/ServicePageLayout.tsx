"use client";

import { motion } from "@/lib/motion";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { MunicipalServiceDetail } from "@/lib/services";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/StructuredData";

interface ServicePageLayoutProps {
  service: MunicipalServiceDetail;
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
  },
};

export default function ServicePageLayout({ service }: ServicePageLayoutProps) {
  const colors = colorMap[service.color] || colorMap.blue;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Services", url: `${siteUrl}/#services` },
    { name: service.name, url: `${siteUrl}/services/${service.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section
          className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary pt-32 pb-16 px-4 sm:px-6 lg:px-8"
          aria-labelledby="service-heading"
        >
          <div className="max-w-4xl mx-auto">
            <Link
              href="/#services"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Services</span>
            </Link>
            <motion.h1
              id="service-heading"
              className="heading-xl text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {service.name}
            </motion.h1>
            <motion.p
              className="body-lg text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {service.shortDescription}
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {/* Description */}
              <motion.div
                className="bg-card rounded-2xl border border-border p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="heading-md text-foreground mb-4">
                  About This Service
                </h2>
                <p className="body-md text-muted-foreground leading-relaxed">
                  {service.fullDescription}
                </p>
              </motion.div>

              {/* Requirements */}
              {service.requirements.length > 0 && (
                <motion.div
                  className="bg-card rounded-2xl border border-border p-6 sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="heading-md text-foreground mb-4">
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {service.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 body-md text-muted-foreground"
                      >
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-medium`}
                        >
                          {index + 1}
                        </span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Steps */}
              {service.steps.length > 0 && (
                <motion.div
                  className="bg-card rounded-2xl border border-border p-6 sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="heading-md text-foreground mb-4">
                    How to Apply
                  </h2>
                  <ol className="space-y-4">
                    {service.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-semibold`}
                        >
                          {index + 1}
                        </span>
                        <p className="body-md text-muted-foreground pt-1">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}

              {/* Fees */}
              {service.fees.length > 0 && (
                <motion.div
                  className="bg-card rounded-2xl border border-border p-6 sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h2 className="heading-md text-foreground mb-4">
                    Fees & Charges
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            Service
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                            Fee
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.fees.map((fee, index) => (
                          <tr
                            key={index}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {fee.name}
                            </td>
                            <td
                              className={`py-3 px-4 text-sm font-medium text-right ${colors.text}`}
                            >
                              {fee.amount}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {fee.note || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Contact Info */}
              <motion.div
                className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 sm:p-8`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h2 className="heading-md text-foreground mb-4">
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Office Location
                    </p>
                    <p className="body-md text-foreground">
                      {service.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Office Hours
                    </p>
                    <p className="body-md text-foreground">
                      {service.officeHours}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Phone
                    </p>
                    <a
                      href={`tel:${service.contactPhone.replace(/\s/g, "")}`}
                      className={`body-md ${colors.text} hover:underline`}
                    >
                      {service.contactPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </p>
                    <a
                      href={`mailto:${service.contactEmail}`}
                      className={`body-md ${colors.text} hover:underline`}
                    >
                      {service.contactEmail}
                    </a>
                  </div>
                </div>

                {service.isOnlineAvailable && service.onlineFormUrl && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <a
                      href={service.onlineFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${colors.bg} ${colors.text} hover:opacity-80`}
                    >
                      Apply Online
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
