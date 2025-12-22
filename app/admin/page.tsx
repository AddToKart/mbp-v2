"use client";

import { useEffect, useState } from "react";
import { motion } from "@/lib/motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  TagIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface DashboardData {
  summary: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    totalViews: number;
  };
  categoryBreakdown: Array<{
    id: number;
    name: string;
    slug: string;
    color: string;
    postCount: number;
  }>;
  monthlyViews: Array<{
    month: string;
    posts: number;
    views: number;
  }>;
  recentPosts: Array<{
    id: number;
    title: string;
    status: string;
    viewCount: number;
    categorySlug: string;
    categoryName: string;
    publishedAt: string | null;
    updatedAt: string;
    createdAt: string;
  }>;
  schedule: {
    scheduledCount: number;
    nextScheduled: string | null;
  };
  recentActivity: Array<{
    title: string;
    status: string;
    updatedAt: string;
    authorName: string;
  }>;
}

export default function AdminDashboard() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;

    async function fetchDashboardData() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [authLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive bg-destructive/10 rounded-lg">
        <p>Error loading dashboard: {error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(
    ...data.monthlyViews.map((m) => m.views),
    100 // Minimum scale
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor your municipal portal performance and activity
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <PlusIcon className="w-5 h-5" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={data.summary.totalPosts}
          icon={DocumentTextIcon}
          description={`${data.summary.publishedPosts} published`}
          trend="neutral"
          color="blue"
        />
        <StatCard
          title="Total Views"
          value={data.summary.totalViews.toLocaleString()}
          icon={EyeIcon}
          description="Lifetime views"
          trend="up"
          color="green"
        />
        <StatCard
          title="Scheduled"
          value={data.summary.scheduledPosts}
          icon={ClockIcon}
          description={
            data.schedule.nextScheduled
              ? `Next: ${new Date(
                data.schedule.nextScheduled
              ).toLocaleDateString()}`
              : "No upcoming posts"
          }
          trend="neutral"
          color="purple"
        />
        <StatCard
          title="Drafts"
          value={data.summary.draftPosts}
          icon={PencilSquareIcon}
          description="Work in progress"
          trend="neutral"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-primary" />
                Engagement Trends
              </CardTitle>
              <CardDescription>
                Monthly views over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
                {data.monthlyViews.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No data available yet
                  </div>
                ) : (
                  data.monthlyViews.map((month, index) => {
                    const heightPercentage = (month.views / maxViews) * 100;
                    return (
                      <div
                        key={month.month}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div className="relative w-full bg-muted/30 rounded-t-lg h-full flex items-end overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercentage}%` }}
                            transition={{
                              duration: 0.8,
                              delay: index * 0.1,
                              ease: "easeOut",
                            }}
                            className="w-full bg-primary/80 group-hover:bg-primary transition-colors relative min-h-[4px]"
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm border border-border">
                              {month.views.toLocaleString()} views
                            </div>
                          </motion.div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(month.month).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary" />
                Content Mix
              </CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {data.categoryBreakdown.slice(0, 5).map((cat, index) => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color || "#3b82f6" }}
                      />
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground">
                      {cat.postCount} posts
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(cat.postCount / data.summary.totalPosts) * 100
                          }%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color || "#3b82f6" }}
                    />
                  </div>
                </div>
              ))}
              {data.categoryBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No categories found
                </p>
              )}
              <div className="pt-2">
                <Link href="/admin/categories">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-primary" />
                  Recent Posts
                </CardTitle>
                <CardDescription>
                  Latest updates and publications
                </CardDescription>
              </div>
              <Link href="/admin/posts">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Views</th>
                      <th className="px-4 py-3 rounded-r-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.recentPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="hover:underline hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="font-normal">
                            {post.categoryName}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              post.status === "published"
                                ? "default"
                                : post.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="capitalize"
                          >
                            {post.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {post.viewCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(
                            post.publishedAt || post.updatedAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {data.recentPosts.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No posts found. Start by creating your first
                          announcement!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                Activity Log
              </CardTitle>
              <CardDescription>Recent system updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {data.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.map((item, i) => (
                    <div key={i} className="relative pl-6">
                      <div
                        className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background ${item.status === "published"
                            ? "bg-emerald-500"
                            : item.status === "scheduled"
                              ? "bg-purple-500"
                              : "bg-blue-500"
                          }`}
                      />
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <UserCircleIcon className="w-3 h-3" />
                        <span>{item.authorName}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] h-5 px-1.5"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="pl-6 text-sm text-muted-foreground">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend: "up" | "down" | "neutral";
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs">
          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}
