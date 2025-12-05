"use client";

import { motion } from "@/lib/motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TruckIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MunicipalServiceDetail, WasteSchedule } from "@/lib/services";

interface WasteManagementContentProps {
  service: MunicipalServiceDetail | null;
  schedule: WasteSchedule | null;
}

const wasteTypeColors = {
  biodegradable: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500",
  },
  recyclable: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
  },
  residual: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500",
  },
};

export default function WasteManagementContent({
  service,
  schedule,
}: WasteManagementContentProps) {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 pt-32 pb-16 px-4 sm:px-6 lg:px-8"
        aria-labelledby="waste-heading"
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
            id="waste-heading"
            className="heading-xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Waste Management
          </motion.h1>
          <motion.p
            className="body-lg text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Check collection schedules and proper waste segregation
          </motion.p>
        </div>
      </section>

      {/* Service Description */}
      {service && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/30">
          <div className="max-w-4xl mx-auto">
            <p className="body-md text-muted-foreground">
              {service.fullDescription}
            </p>
          </div>
        </section>
      )}

      {/* Waste Collection Schedule */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Waste Type Legend */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="heading-md text-foreground mb-4">
              <CalendarDaysIcon
                className="w-6 h-6 inline-block mr-2"
                aria-hidden="true"
              />
              Collection Schedule
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge
                className={`${wasteTypeColors.biodegradable.bg} ${wasteTypeColors.biodegradable.text}`}
              >
                🥬 Biodegradable
              </Badge>
              <Badge
                className={`${wasteTypeColors.recyclable.bg} ${wasteTypeColors.recyclable.text}`}
              >
                ♻️ Recyclable
              </Badge>
              <Badge
                className={`${wasteTypeColors.residual.bg} ${wasteTypeColors.residual.text}`}
              >
                🗑️ Residual
              </Badge>
            </div>
          </motion.div>

          {/* Zone Schedules */}
          {schedule?.zones.map((zone, index) => (
            <motion.div
              key={zone.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="heading-sm text-foreground mb-2">
                    {zone.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Barangays: {zone.barangays.join(", ")}
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div
                      className={`p-4 rounded-lg ${wasteTypeColors.biodegradable.bg} border-l-4 ${wasteTypeColors.biodegradable.border}`}
                    >
                      <p
                        className={`text-sm font-semibold ${wasteTypeColors.biodegradable.text}`}
                      >
                        Biodegradable
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {zone.schedule.biodegradable.join(", ")}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${wasteTypeColors.recyclable.bg} border-l-4 ${wasteTypeColors.recyclable.border}`}
                    >
                      <p
                        className={`text-sm font-semibold ${wasteTypeColors.recyclable.text}`}
                      >
                        Recyclable
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {zone.schedule.recyclable.join(", ")}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${wasteTypeColors.residual.bg} border-l-4 ${wasteTypeColors.residual.border}`}
                    >
                      <p
                        className={`text-sm font-semibold ${wasteTypeColors.residual.text}`}
                      >
                        Residual
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {zone.schedule.residual.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Guidelines */}
          {schedule?.guidelines && schedule.guidelines.length > 0 && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30">
                <CardContent className="p-6">
                  <h3 className="heading-sm text-foreground mb-4">
                    <TruckIcon
                      className="w-5 h-5 inline-block mr-2"
                      aria-hidden="true"
                    />
                    Waste Segregation Guidelines
                  </h3>
                  <ul className="space-y-3">
                    {schedule.guidelines.map((guideline, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <CheckCircleIcon
                          className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Service Info */}
          {service && (
            <motion.div
              className="mt-8 bg-card rounded-2xl border border-border p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h3 className="heading-sm text-foreground mb-4">Contact MENRO</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Location:</strong> {service.location}
                </div>
                <div>
                  <strong>Hours:</strong> {service.officeHours}
                </div>
                <div>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${service.contactEmail}`}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {service.contactEmail}
                  </a>
                </div>
                <div>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${service.contactPhone}`}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {service.contactPhone}
                  </a>
                </div>
              </div>

              {/* Fees if any */}
              {service.fees.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Service Fees
                  </h4>
                  <div className="space-y-2">
                    {service.fees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {fee.name}
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {fee.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
