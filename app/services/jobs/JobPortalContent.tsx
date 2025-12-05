"use client";

import { motion } from "@/lib/motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  MunicipalServiceDetail,
  JobListing,
  JobListingsResponse,
} from "@/lib/services";

interface JobPortalContentProps {
  service: MunicipalServiceDetail | null;
  initialJobs: JobListingsResponse;
}

const employmentTypeLabels: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contractual: "Contractual",
  temporary: "Temporary",
};

export default function JobPortalContent({
  service,
  initialJobs,
}: JobPortalContentProps) {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 pt-32 pb-16 px-4 sm:px-6 lg:px-8"
        aria-labelledby="jobs-heading"
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
            id="jobs-heading"
            className="heading-xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Job Portal
          </motion.h1>
          <motion.p
            className="body-lg text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find local employment opportunities in Santa Maria, Bulacan
          </motion.p>
        </div>
      </section>

      {/* Service Info */}
      {service && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-900/30">
          <div className="max-w-4xl mx-auto">
            <p className="body-md text-muted-foreground">
              {service.fullDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                <strong>Location:</strong> {service.location}
              </span>
              <span>
                <strong>Hours:</strong> {service.officeHours}
              </span>
              <span>
                <strong>Phone:</strong>{" "}
                <a
                  href={`tel:${service.contactPhone}`}
                  className="text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {service.contactPhone}
                </a>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Job Listings */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-md text-foreground">Current Job Openings</h2>
            <Badge variant="secondary">
              {initialJobs.pagination.total} Jobs Available
            </Badge>
          </div>

          {initialJobs.jobs.length === 0 ? (
            <Card className="p-8 text-center">
              <BriefcaseIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="heading-sm text-foreground mb-2">
                No job listings available
              </h3>
              <p className="body-md text-muted-foreground">
                Check back later for new opportunities or visit the PESO office
                for more information.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {initialJobs.jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {job.isFeatured && (
                              <Badge className="bg-orange-500 text-white">
                                <StarIcon className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {employmentTypeLabels[job.employmentType] ||
                                job.employmentType}
                            </Badge>
                          </div>

                          <h3 className="heading-sm text-foreground mb-1">
                            {job.title}
                          </h3>
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
                            {job.companyName}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <MapPinIcon
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                              {job.location}
                            </span>
                            {job.salaryRange && (
                              <span className="flex items-center gap-1">
                                <CurrencyDollarIcon
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                                {job.salaryRange}
                              </span>
                            )}
                            {job.applicationDeadline && (
                              <span className="flex items-center gap-1">
                                <ClockIcon
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                                Deadline:{" "}
                                {new Date(
                                  job.applicationDeadline
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <p className="body-sm text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>

                          {job.requirements.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Requirements:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.requirements.slice(0, 3).map((req, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {req.length > 30
                                      ? `${req.substring(0, 30)}...`
                                      : req}
                                  </Badge>
                                ))}
                                {job.requirements.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{job.requirements.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <a
                            href={`mailto:${job.contactEmail}?subject=Application for ${job.title}`}
                            className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                          >
                            Apply Now
                          </a>
                          {job.contactPhone && (
                            <a
                              href={`tel:${job.contactPhone}`}
                              className="inline-flex items-center justify-center px-4 py-2 border border-orange-600 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                            >
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* PESO Info */}
          {service && (
            <motion.div
              className="mt-12 bg-orange-100 dark:bg-orange-950/30 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="heading-sm text-foreground mb-4">
                Public Employment Service Office (PESO)
              </h3>
              <p className="body-md text-muted-foreground mb-4">
                Visit our PESO office for personalized job matching, career
                counseling, and information about job fairs and training
                programs.
              </p>
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
                    className="text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    {service.contactEmail}
                  </a>
                </div>
                <div>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${service.contactPhone}`}
                    className="text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    {service.contactPhone}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
