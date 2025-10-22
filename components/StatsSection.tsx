"use client";

import { motion } from "@/lib/motion";
import { useId, useMemo } from "react";
import {
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  GlobeAsiaAustraliaIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

type GrowthPoint = {
  year: string;
  value: number;
};

type ServiceStat = {
  name: string;
  current: number;
  previous: number;
};

const growthData: GrowthPoint[] = [
  { year: "2021", value: 128 },
  { year: "2022", value: 134 },
  { year: "2023", value: 141 },
  { year: "2024", value: 147 },
  { year: "2025", value: 156 },
];

const serviceData: ServiceStat[] = [
  { name: "Health Services", previous: 85, current: 92 },
  { name: "Education Programs", previous: 80, current: 88 },
  { name: "Public Safety", previous: 90, current: 95 },
  { name: "Infrastructure", previous: 68, current: 76 },
];

const quickMetrics = [
  { label: "Digital service adoption", value: "68%", delta: "+12% vs 2024" },
  { label: "Barangay Wi-Fi coverage", value: "21/24", delta: "+7 barangays" },
  { label: "Community partners", value: "115", delta: "+24 active groups" },
];

const highlightItems = [
  {
    icon: BuildingOffice2Icon,
    title: "Northern growth corridor",
    description:
      "Industrial parks along MacArthur Highway attract logistics, agritech, and light manufacturing hubs to Santa Maria.",
  },
  {
    icon: SparklesIcon,
    title: "Smart citizen services",
    description:
      "The municipal one-stop portal processed 42K requests in 2025—an 18% jump after rolling out kiosk integrations in public markets.",
  },
  {
    icon: GlobeAsiaAustraliaIcon,
    title: "Resilient river barangays",
    description:
      "Green infrastructure upgrades along the Santa Maria River cut flood-related incidents by 23% across Sapang Palay, Catmon, and surrounding sitios.",
  },
];

const formatThousands = (value: number) => `${value.toLocaleString()}K`;

export default function StatsSection() {
  const chartWidth = 620;
  const chartHeight = 180;
  const gradientId = useId();
  const strokeId = useId();

  const { linePath, areaPath, points, yTicks } = useMemo(() => {
    if (growthData.length === 0) {
      return { linePath: "", areaPath: "", points: [], yTicks: [] };
    }

    const values = growthData.map((point) => point.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const buffer = Math.max((max - min) * 0.2, 6);
    const upper = max + buffer;
    const lower = Math.max(0, min - buffer);
    const span = upper - lower || 1;
    const step =
      growthData.length > 1 ? chartWidth / (growthData.length - 1) : chartWidth;

    const computedPoints = growthData.map((point, index) => {
      const x = growthData.length > 1 ? index * step : chartWidth / 2;
      const normalized = (point.value - lower) / span;
      const y = chartHeight - normalized * chartHeight;
      return { x, y, value: point.value, label: point.year };
    });

    const path = computedPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const area = computedPoints.length
      ? `M ${computedPoints[0].x} ${chartHeight} L ${computedPoints
          .map((point) => `${point.x} ${point.y}`)
          .join(" ")} L ${
          computedPoints[computedPoints.length - 1].x
        } ${chartHeight} Z`
      : "";

    const ticks = Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      const value = upper - (upper - lower) * ratio;
      return {
        id: `${index}`,
        y: chartHeight * ratio,
        value: Math.round(value),
      };
    });

    return {
      linePath: path,
      areaPath: area,
      points: computedPoints,
      yTicks: ticks,
    };
  }, [chartHeight, chartWidth]);

  const currentYear = growthData[growthData.length - 1];
  const previousYear = growthData[growthData.length - 2];
  const absoluteChange = currentYear.value - previousYear.value;
  const percentChange = (absoluteChange / previousYear.value) * 100;

  return (
    <section
      id="transparency"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 bg-gradient-to-b from-background via-muted/20 to-background"
    >
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground shadow-sm dark:border-border/40 dark:bg-background/40">
            Municipality insights
          </span>
          <h2 className="heading-lg mt-6 text-foreground">
            Santa Maria, Bulacan at a glance
          </h2>
          <p className="body-lg mt-4 text-muted-foreground">
            Tracking resident engagement, service delivery, and community
            resilience as the municipality scales its smart city programs.
          </p>
        </motion.div>

        {/* Growth Chart - Full Width Top */}
        <motion.article
          className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-surface/80 p-7 shadow-xl backdrop-blur-xl transition-colors dark:border-border/40 dark:bg-surface/55 lg:p-8 xl:p-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-sm">
                Resident engagement
              </p>
              <p className="mt-3 text-4xl font-semibold text-foreground sm:text-5xl">
                {formatThousands(currentYear.value)} citizens
              </p>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                +{formatThousands(absoluteChange)} vs {previousYear.year}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300 sm:text-base">
              <ArrowTrendingUpIcon className="h-5 w-5" aria-hidden />
              <span>{percentChange.toFixed(1)}% growth</span>
            </div>
          </div>

          <div className="relative mt-10 grid gap-10 lg:mt-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-8 xl:gap-12">
            <div>
              <motion.svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full"
                preserveAspectRatio="none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.35"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                  <linearGradient id={strokeId} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>

                <g>
                  {yTicks.map((tick) => (
                    <line
                      key={tick.id}
                      x1="0"
                      x2={chartWidth}
                      y1={tick.y}
                      y2={tick.y}
                      stroke="var(--border)"
                      strokeDasharray="6 8"
                      strokeOpacity="0.35"
                    />
                  ))}
                </g>

                {areaPath && (
                  <motion.path
                    d={areaPath}
                    fill={`url(#${gradientId})`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                )}

                {linePath && (
                  <motion.path
                    d={linePath}
                    fill="none"
                    stroke={`url(#${strokeId})`}
                    strokeWidth={3}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 1.1,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                  />
                )}

                {points.map((point, index) => (
                  <motion.g
                    key={point.label}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.35 + index * 0.08,
                    }}
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={5.5}
                      fill="var(--background)"
                      stroke="var(--primary)"
                      strokeWidth={2}
                    />
                  </motion.g>
                ))}
              </motion.svg>

              <div className="mt-5 grid grid-cols-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
                {growthData.map((point) => (
                  <span key={point.year}>{point.year}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-background/60 p-5 text-left dark:border-border/40 dark:bg-background/30 lg:p-6">
              {quickMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-start justify-between gap-4 rounded-xl bg-surface/60 px-4 py-3 text-sm transition-colors hover:bg-surface/80 dark:bg-surface/40 dark:hover:bg-surface/60"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-sm">
                    {metric.label}
                  </span>
                  <span className="flex flex-col items-end text-right">
                    <span className="text-lg font-semibold text-foreground sm:text-xl">
                      {metric.value}
                    </span>
                    <span className="text-xs text-muted-foreground sm:text-sm">
                      {metric.delta}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Bottom Two Cards - Side by Side */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-10">
          <motion.article
            className="rounded-[2.5rem] border border-border/50 bg-surface/80 p-7 shadow-lg backdrop-blur-xl transition-colors dark:border-border/40 dark:bg-surface/55 lg:p-8"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Service delivery
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground lg:text-3xl">
                  Year-over-year improvements
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary dark:bg-primary/15 dark:text-primary-light">
                vs 2024 baselines
              </span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground lg:text-base">
              Coverage indices combine barangay submissions, public feedback,
              and automated kiosk tallies to track how programs performed across
              24 barangays.
            </p>

            <div className="mt-7 space-y-6">
              {serviceData.map((service, index) => {
                const delta = service.current - service.previous;
                const trendClass =
                  delta >= 0
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-rose-500 dark:text-rose-300";

                return (
                  <div key={service.name} className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground lg:text-base">
                      <span>{service.name}</span>
                      <span className="tabular-nums">
                        {service.current}%
                        <span className={`ml-2 text-sm ${trendClass}`}>
                          {delta >= 0 ? "+" : ""}
                          {delta}%
                        </span>
                      </span>
                    </div>
                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/40">
                      <motion.div
                        className="absolute inset-y-0 left-0 w-full rounded-full bg-primary/20"
                        style={{ transformOrigin: "left" }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: service.previous / 100 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      />
                      <motion.div
                        className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary shadow-lg"
                        style={{ transformOrigin: "left" }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: service.current / 100 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: 0.6,
                          delay: 0.1 + index * 0.1,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Service Delivery Info */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-background/60 p-5 dark:border-border/40 dark:bg-background/30">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-foreground">2.4 days</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">
                  -18% faster
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Citizen Satisfaction
                </p>
                <p className="text-2xl font-bold text-foreground">4.6/5</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">
                  +0.4 improvement
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border/50 bg-background/60 p-5 dark:border-border/40 dark:bg-background/30">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Next Priority Areas
              </p>
              <p className="mt-2 text-sm text-muted-foreground lg:text-base">
                Focus on digital inclusion programs, expanded healthcare access
                in rural barangays, and modernized waste management systems
                across all districts.
              </p>
            </div>
          </motion.article>

          <motion.article
            className="rounded-[2.5rem] border border-border/50 bg-surface/80 p-7 shadow-lg backdrop-blur-xl transition-colors dark:border-border/40 dark:bg-surface/55 lg:p-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Municipality profile
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground lg:text-3xl">
              Santa Maria is Bulacan&apos;s innovation gateway
            </h3>
            <p className="mt-4 text-sm text-muted-foreground lg:text-base">
              With more than 30 barangays spanning agro-industrial estates,
              Santa Maria provides Metro Manila access while keeping its
              agricultural roots strong. Coordinated investments keep citizens
              connected and resilient.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4">
              {highlightItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex h-full flex-col gap-3 rounded-3xl border border-border/50 bg-background/60 p-5 transition-all hover:bg-background/80 hover:shadow-md dark:border-border/40 dark:bg-background/35 dark:hover:bg-background/50"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-base font-semibold text-foreground lg:text-lg">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground lg:text-base">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
