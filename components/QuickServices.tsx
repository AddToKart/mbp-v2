"use client";

import { motion } from "@/lib/motion";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  HeartIcon,
  TruckIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const services = [
  {
    name: "Business Permits",
    description: "Apply or renew business licenses online",
    icon: BriefcaseIcon,
    href: "/services/business",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    name: "Real Property Tax",
    description: "Pay your property taxes securely",
    icon: BuildingOfficeIcon,
    href: "/services/tax",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    name: "Civil Registry",
    description: "Birth, marriage, and death certificates",
    icon: DocumentTextIcon,
    href: "/services/civil-registry",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    name: "Health Center",
    description: "Schedule appointments and checkups",
    icon: HeartIcon,
    href: "/services/health",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    name: "Job Portal",
    description: "Find local employment opportunities",
    icon: UserGroupIcon,
    href: "/services/jobs",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    name: "Waste Management",
    description: "Check collection schedules",
    icon: TruckIcon,
    href: "/services/waste",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    name: "Scholarships",
    description: "Apply for educational assistance",
    icon: AcademicCapIcon,
    href: "/services/education",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    name: "Tourism",
    description: "Discover local attractions and events",
    icon: MapIcon,
    href: "/services/tourism",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export default function QuickServices() {
  return (
    <section
      id="services"
      className="py-24 bg-surface/50 relative overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            id="services-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Essential Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Access municipal services quickly and easily from the comfort of
            your home.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link href={service.href} className="block h-full group">
                <div className="relative h-full p-6 rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 overflow-hidden">
                  <div
                    className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${service.color}`}
                    aria-hidden="true"
                  >
                    <service.icon className="w-24 h-24 -mr-6 -mt-6 rotate-12" />
                  </div>

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.bg} ${service.color}`}
                    aria-hidden="true"
                  >
                    <service.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
