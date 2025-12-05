"use client";

// Force HMR update

import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  AnimatePresence,
} from "@/lib/motion";
import Link from "next/link";
import {
  MunicipalServiceDetail,
  TourismItemsResponse,
  fetchTourismItems,
  TourismItem,
} from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  CameraIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/StructuredData";
import OptimizedImage from "@/components/OptimizedImage";
import bgHall from "@/images/bg_hall.jpg";
import { cn } from "@/lib/utils";

interface TourismContentProps {
  service: MunicipalServiceDetail | null;
  initialItems: TourismItemsResponse;
}

// --- Components ---

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;

    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
    >
      {children}
    </motion.div>
  );
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getItemSchedule(item: TourismItem) {
  if (item.type === "event") {
    if (item.eventStartDate) {
      const start = formatDate(item.eventStartDate);
      const end = item.eventEndDate
        ? ` - ${formatDate(item.eventEndDate)}`
        : "";
      return `${start}${end}`;
    }
    return "Date TBA";
  }
  return item.openingHours || "Daily";
}

// --- Main Page ---

export default function TourismContent({
  service,
  initialItems,
}: TourismContentProps) {
  const [page] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Services", url: `${siteUrl}/#services` },
    { name: "Tourism", url: `${siteUrl}/services/tourism` },
  ];

  const { data: tourismData } = useQuery({
    queryKey: ["tourism-items", page],
    queryFn: () => fetchTourismItems(page, 12),
    initialData: page === 1 ? initialItems : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const items = tourismData?.items || initialItems?.items || [];

  // Filter items
  const filteredItems =
    filter === "all" ? items : items.filter((item) => item.type === filter);

  const categories = [
    { value: "all", label: "All Destinations" },
    { value: "attraction", label: "Attractions" },
    { value: "event", label: "Events & Festivals" },
  ];

  const featuredItem = items[0];

  const stats = [
    { label: "Historical Sites", value: "15+" },
    { label: "Nature Spots", value: "10+" },
    { label: "Food Hubs", value: "50+" },
    { label: "Annual Events", value: "12+" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main
        ref={containerRef}
        className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground"
      >
        {/* --- Hero Section --- */}
        <section className="relative h-[100svh] flex flex-col justify-center overflow-hidden">
          {/* Background Image with Parallax & Zoom */}
          <motion.div
            style={{ y: shouldReduceMotion ? 0 : heroY, scale: 1.1 }}
            className="absolute inset-0 z-0"
          >
            <OptimizedImage
              src={bgHall}
              alt="Santa Maria Tourism Hero"
              priority
              enableHover={false}
              className="object-cover w-full h-full"
            />
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
            <div className="absolute inset-0 bg-noise mix-blend-overlay" />
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10 max-w-4xl mx-auto"
            >
              {/* Back Button - Glass Pill */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Link
                  href="/#services"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 group shadow-lg shadow-black/10"
                >
                  <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Back to Services</span>
                </Link>
              </motion.div>

              {/* Title & Subtitle */}
              <div className="space-y-6">
                <motion.h1
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9]"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                  Discover
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-white animate-gradient-x pb-4">
                    Santa Maria
                  </span>
                </motion.h1>

                <motion.p
                  className="max-w-2xl mx-auto text-lg md:text-2xl text-white/80 font-light leading-relaxed tracking-wide"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  Journey through history, culture, and nature in the heart of
                  Bulacan.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Button
                  size="lg"
                  className="rounded-full px-10 h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-all duration-500 w-full sm:w-auto"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Explore Attractions
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-14 text-lg font-semibold bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
                >
                  <CalendarDaysIcon className="w-5 h-5 mr-2" />
                  View Events
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Section - Floating Glass Strip */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute bottom-10 left-0 right-0 z-20 px-4"
          >
            <div className="container mx-auto max-w-5xl">
              <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center group cursor-default">
                      <div className="text-3xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-500 ease-out">
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-white/60 uppercase tracking-widest font-medium group-hover:text-white/90 transition-colors">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- Featured Spotlight --- */}
        {featuredItem && (
          <section className="py-20 md:py-32 relative z-10 container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-stretch gap-8 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 relative aspect-[4/3] md:aspect-auto min-h-[400px] rounded-3xl overflow-hidden shadow-2xl group"
              >
                {/* Placeholder Gradient if no image */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${featuredItem.type === "attraction"
                    ? "from-blue-600 to-indigo-900"
                    : "from-orange-500 to-red-900"
                    }`}
                />
                {featuredItem.featuredImage && (
                  <OptimizedImage
                    src={featuredItem.featuredImage}
                    alt={featuredItem.title}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {!featuredItem.featuredImage && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <CameraIcon className="w-32 h-32" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 flex flex-col justify-center space-y-8"
              >
                <div className="flex items-center gap-3">
                  <Badge className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                    <StarIcon className="w-4 h-4 mr-1 fill-current" />
                    Featured Destination
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    {featuredItem.type}
                  </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  {featuredItem.title}
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {featuredItem.fullDescription ||
                    featuredItem.shortDescription}
                </p>

                <div className="grid grid-cols-2 gap-6 py-6 border-y border-border/50">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Location
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {featuredItem.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {featuredItem.type === "event" ? "Date" : "Open Hours"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {getItemSchedule(featuredItem)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    size="lg"
                    className="rounded-full px-8 text-lg h-14 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  >
                    Explore Details
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* --- Main Listing --- */}
        <section className="pb-32 relative z-10 container mx-auto px-4">
          {/* Sticky Filter Bar */}
          <div className="sticky top-24 z-30 mb-16 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-background/80 backdrop-blur-xl border border-border/50 p-1.5 rounded-full shadow-2xl shadow-black/5 inline-flex gap-1">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setFilter(category.value)}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${filter === category.value
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {filter === category.value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-full shadow-sm"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Masonry-ish Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <TiltCard className="h-full">
                    <div className="group h-full bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative">
                      {/* Card Image */}
                      <div className="relative h-72 overflow-hidden bg-muted">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${item.type === "attraction"
                            ? "from-blue-500/10 to-purple-500/10"
                            : "from-orange-500/10 to-red-500/10"
                            }`}
                        />

                        {item.featuredImage && (
                          <OptimizedImage
                            src={item.featuredImage}
                            alt={item.title}
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                          <span className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            View Details
                          </span>
                        </div>

                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <Badge
                            variant="secondary"
                            className="bg-background/90 backdrop-blur-md shadow-sm border-transparent"
                          >
                            {item.type === "attraction"
                              ? "Attraction"
                              : "Event"}
                          </Badge>
                          {(item.entranceFee === "FREE" ||
                            !item.entranceFee) && (
                              <Badge className="bg-green-500/90 text-white border-transparent backdrop-blur-md">
                                FREE
                              </Badge>
                            )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-8 flex-grow flex flex-col relative">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                            {item.title}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-1">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                            {item.location}
                          </div>
                        </div>

                        <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed flex-grow">
                          {item.shortDescription}
                        </p>

                        <div className="pt-6 border-t border-border/50 flex items-center justify-between text-sm font-medium text-muted-foreground">
                          <span>
                            {item.type === "event" ? (
                              <span className="flex items-center gap-2">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {getItemSchedule(item)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                {getItemSchedule(item)}
                              </span>
                            )}
                          </span>
                          <ArrowRightIcon className="w-5 h-5 text-primary transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <div className="text-center py-32">
              <div className="inline-flex p-8 rounded-full bg-muted/50 mb-6 animate-pulse">
                <SparklesIcon className="w-16 h-16 text-muted-foreground/50" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">
                No items found
              </h3>
              <p className="text-muted-foreground text-xl max-w-md mx-auto">
                We couldn't find any destinations matching your filter. Try
                checking back later!
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
