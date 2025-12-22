"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
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
  BarChart,
  Bar,
} from "recharts";
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ListBulletIcon,
  Squares2X2Icon,
  UserIcon,
  ArrowPathIcon,
  FireIcon,
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

type ViewMode = "list" | "card";

export default function AdminAnalyticsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<PostAnalytics | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingPosts(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load posts");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) fetchPosts();
  }, [authLoading, isAuthenticated, fetchPosts]);

  // Filtered & paginated posts
  const filteredPosts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter((post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.authorName.toLowerCase().includes(lowerQuery)
    );
  }, [posts, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Stats
  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
    const publishedPosts = posts.filter(p => p.status === "published");
    const avgViews = publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0;
    const topPost = [...posts].sort((a, b) => b.viewCount - a.viewCount)[0];

    return {
      totalPosts: posts.length,
      totalViews,
      avgViews,
      topPost: topPost?.title || "N/A",
      topViews: topPost?.viewCount || 0,
    };
  }, [posts]);

  // Fetch analytics for a post
  const fetchAnalytics = useCallback(async (postId: number) => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/posts/${postId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  const handleViewAnalytics = (postId: number) => {
    setSelectedPostId(postId);
    setAnalyticsData(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (selectedPostId && isModalOpen) {
      fetchAnalytics(selectedPostId);
    }
  }, [selectedPostId, isModalOpen, fetchAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-500/10 text-emerald-600 border-0";
      case "draft":
        return "bg-slate-500/10 text-slate-600 border-0";
      case "scheduled":
        return "bg-blue-500/10 text-blue-600 border-0";
      default:
        return "bg-muted text-muted-foreground border-0";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          </div>
          <p className="text-muted-foreground mt-1">Real-time insights into your post performance</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchPosts} disabled={isLoadingPosts} className="gap-2">
          <ArrowPathIcon className={`w-4 h-4 ${isLoadingPosts ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.totalPosts}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.totalViews.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10">
                <EyeIcon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Views</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.avgViews.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-full bg-violet-500/10">
                <ArrowTrendingUpIcon className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Post Views</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.topViews.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <FireIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 border-0 bg-muted/50 focus-visible:bg-background"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {/* View Toggle */}
              <div className="flex items-center bg-muted/50 rounded-md p-1">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-7 px-2"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "card" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className="h-7 px-2"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {filteredPosts.length} posts
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List/Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Post Performance</CardTitle>
          <CardDescription>Click on a post to view detailed analytics</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 flex items-center gap-2">
              {error}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div>
              {isLoadingPosts ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : paginatedPosts.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No posts found</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="px-6 py-4 hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-0 cursor-pointer"
                      onClick={() => handleViewAnalytics(post.id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {post.authorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <Badge className={`capitalize ${getStatusColor(post.status)}`}>
                          {post.status}
                        </Badge>

                        {/* Views */}
                        <div className="flex items-center gap-2 min-w-[80px] justify-end">
                          <EyeIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{post.viewCount.toLocaleString()}</span>
                        </div>

                        {/* Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                          onClick={(e) => { e.stopPropagation(); handleViewAnalytics(post.id); }}
                        >
                          <ChartBarIcon className="w-4 h-4" />
                          Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoadingPosts ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-muted/30 rounded-lg animate-pulse" />
                ))
              ) : paginatedPosts.length === 0 ? (
                <div className="col-span-full p-16 text-center text-muted-foreground">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No posts found</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card
                        className="h-full border-0 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col"
                        onClick={() => handleViewAnalytics(post.id)}
                      >
                        <CardContent className="p-4 flex flex-col flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <Badge className={`capitalize ${getStatusColor(post.status)}`}>
                              {post.status}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm font-semibold">
                              <EyeIcon className="w-4 h-4 text-muted-foreground" />
                              {post.viewCount.toLocaleString()}
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{post.title}</h3>

                          {/* Footer */}
                          <div className="pt-3 mt-auto border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5" />
                              {post.authorName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredPosts.length > postsPerPage && (
            <div className="border-t border-border/50 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + postsPerPage, filteredPosts.length)} of {filteredPosts.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl border-0 shadow-2xl bg-background p-0 overflow-hidden">
          <DialogHeader className="bg-muted/30 border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ChartBarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Post Analytics</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {analyticsData?.title || "Loading..."}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            {isLoadingAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />
              </div>
            ) : analyticsData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <EyeIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Views</p>
                          <p className="text-xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Published</p>
                          <p className="text-xl font-bold">{formatDate(analyticsData.publishedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10">
                          <ArrowTrendingUpIcon className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-xl font-bold capitalize">{analyticsData.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <Card className="border-0 bg-muted/30 overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base">Views Over Time</CardTitle>
                    <CardDescription>Daily view count for the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.dailyViews} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "none",
                              borderRadius: "var(--radius)",
                              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                            }}
                            labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          />
                          <Area
                            type="monotone"
                            dataKey="views"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#colorViews)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
