"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface Post {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  authorName: string;
}

interface PostAnalytics {
  title: string;
  status: string;
  publishedAt: string | null;
  totalViews: number;
  dailyViews: Array<{ date: string; views: number }>;
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  delay,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtitle: string;
  delay: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.4,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <Card className="relative overflow-hidden border border-border/50 shadow-sm bg-card hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className="p-2 rounded-lg bg-muted/50">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-foreground">
            {value}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </m.div>
  );
}

export default function AdminAnalyticsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<PostAnalytics | null>(
    null
  );
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + postsPerPage
  );

  // Optimized fetch with abort controller
  const fetchPostsWithAbort = useCallback(
    async (signal: AbortSignal) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE_URL}/admin/posts`, {
          credentials: "include",
          signal,
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data || []);
        setFilteredPosts(data || []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to fetch posts:", error);
          setError("Failed to load posts");
        }
      } finally {
        setIsLoadingPosts(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    if (authLoading) return;
    if (isAuthenticated) {
      fetchPostsWithAbort(controller.signal);
    }
    return () => controller.abort();
  }, [authLoading, isAuthenticated, fetchPostsWithAbort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(lowerQuery)
      );
      setFilteredPosts(filtered);
      setCurrentPage(1); // Reset to first page on search
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, posts]);

  // Memoized analytics fetch
  const fetchAnalytics = useCallback(
    async (postId: number, signal: AbortSignal) => {
      setIsLoadingAnalytics(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/analytics/posts/${postId}`,
          {
            credentials: "include",
            signal,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setAnalyticsData(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to fetch analytics:", error);
          setError("Failed to load analytics");
        }
      } finally {
        setIsLoadingAnalytics(false);
      }
    },
    []
  );

  const handleViewAnalytics = (postId: number) => {
    setSelectedPostId(postId);
    setAnalyticsData(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
    setAnalyticsData(null);
  };

  useEffect(() => {
    if (!selectedPostId || !isModalOpen) return;
    const controller = new AbortController();
    fetchAnalytics(selectedPostId, controller.signal);
    return () => controller.abort();
  }, [selectedPostId, isModalOpen, fetchAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-600 text-white border-transparent shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white";
      case "draft":
        return "bg-slate-200 text-slate-700 border-transparent hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200";
      case "scheduled":
        return "bg-blue-600 text-white border-transparent shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:text-white";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 p-4 md:p-8 max-w-[1800px] mx-auto"
    >
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Analytics
            </h1>
          </div>
          <p className="text-muted-foreground">
            Real-time insights into your post performance and engagement metrics
          </p>
        </div>
      </m.div>

      {/* Posts Table Card */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="border border-border/50 shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Posts Overview
                </CardTitle>
                <CardDescription className="mt-1">
                  Select a post to view detailed analytics
                </CardDescription>
              </div>
              <div className="relative w-full md:w-96 flex-shrink-0">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  className="pl-10 bg-background border-border focus-visible:ring-primary/30 rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent bg-muted/20">
                    <TableHead className="w-[40%] pl-6 h-12 font-semibold">
                      Title
                    </TableHead>
                    <TableHead className="h-12 font-semibold">Status</TableHead>
                    <TableHead className="h-12 font-semibold">
                      Published
                    </TableHead>
                    <TableHead className="text-right h-12 font-semibold">
                      Views
                    </TableHead>
                    <TableHead className="text-right pr-6 h-12 font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPosts ? (
                    [...Array(6)].map((_, i) => (
                      <TableRow key={i} className="border-border/20">
                        <TableCell className="pl-6 py-4">
                          <div className="h-4 w-48 bg-muted/40 rounded-md animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-4 w-16 bg-muted/40 rounded-md animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-4 w-20 bg-muted/40 rounded-md animate-pulse" />
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="h-4 w-12 bg-muted/40 rounded-md animate-pulse ml-auto" />
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="h-9 w-32 bg-muted/40 rounded-md animate-pulse ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <p className="text-sm text-destructive">{error}</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredPosts.length > 0 ? (
                    paginatedPosts.map((post, idx) => (
                      <m.tr
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.03,
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="border-border/30 hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="pl-6 py-4 font-medium text-foreground truncate max-w-xs">
                          {post.title}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`capitalize font-normal text-xs ${getStatusColor(
                              post.status
                            )}`}
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                            : "—"}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5 text-foreground font-semibold">
                            <EyeIcon className="h-4 w-4 text-primary/70" />
                            {post.viewCount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnalytics(post.id)}
                            className="gap-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                            View Analytics
                          </Button>
                        </TableCell>
                      </m.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <p className="text-sm text-muted-foreground">
                          No posts found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination */}
          {filteredPosts.length > postsPerPage && (
            <div className="border-t border-border/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + postsPerPage, filteredPosts.length)} of{" "}
                  {filteredPosts.length} posts
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, idx, arr) => (
                        <span key={page} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        </span>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </m.div>

      {/* Analytics Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl border border-border shadow-xl bg-background p-0 overflow-hidden">
              <m.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{
                  duration: 0.35,
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
              >
                <DialogHeader className="bg-muted/30 border-b border-border p-6">
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <ChartBarIcon className="h-6 w-6 text-primary" />
                      Analytics Details
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Performance metrics for{" "}
                      <span className="font-semibold text-foreground">
                        "{analyticsData?.title || "Loading..."}"
                      </span>
                    </p>
                  </div>
                </DialogHeader>

                <div className="px-6 py-6">
                  {isLoadingAnalytics ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-32 bg-muted/30 rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                      <div className="h-80 bg-muted/30 rounded-xl animate-pulse" />
                    </div>
                  ) : analyticsData ? (
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                          icon={EyeIcon}
                          label="Total Views"
                          value={analyticsData.totalViews.toLocaleString()}
                          subtitle="All-time views"
                          delay={0}
                        />
                        <StatCard
                          icon={CalendarIcon}
                          label="Published Date"
                          value={
                            analyticsData.publishedAt
                              ? new Date(
                                analyticsData.publishedAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                              : "N/A"
                          }
                          subtitle={
                            analyticsData.publishedAt
                              ? new Date(analyticsData.publishedAt)
                                .getFullYear()
                                .toString()
                              : "Not published"
                          }
                          delay={0.1}
                        />
                        <StatCard
                          icon={ArrowTrendingUpIcon}
                          label="Status"
                          value={analyticsData.status}
                          subtitle="Current status"
                          delay={0.2}
                        />
                      </div>

                      {/* Chart */}
                      <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
                          <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-lg font-semibold">
                              Views Over Time
                            </CardTitle>
                            <CardDescription>
                              Daily view count for the last 30 days
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="h-80 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={analyticsData.dailyViews}
                                  margin={{
                                    top: 10,
                                    right: 20,
                                    left: -10,
                                    bottom: 0,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="colorViewsGradient"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="hsl(var(--border))"
                                    opacity={0.3}
                                  />
                                  <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) =>
                                      new Date(value).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )
                                    }
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                      typeof value === "number"
                                        ? value.toLocaleString()
                                        : value
                                    }
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "hsl(var(--popover))",
                                      borderColor: "transparent",
                                      borderRadius: "var(--radius)",
                                      boxShadow:
                                        "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                                    }}
                                    itemStyle={{
                                      color: "hsl(var(--foreground))",
                                      fontWeight: 600,
                                    }}
                                    labelStyle={{
                                      color: "hsl(var(--muted-foreground))",
                                      fontSize: "12px",
                                    }}
                                    labelFormatter={(value) =>
                                      new Date(value).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )
                                    }
                                    cursor={{
                                      stroke: "hsl(var(--primary))",
                                      strokeWidth: 2,
                                      opacity: 0.3,
                                    }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorViewsGradient)"
                                    isAnimationActive={true}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </m.div>
                    </m.div>
                  ) : null}
                </div>
              </m.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </m.div>
  );
}
