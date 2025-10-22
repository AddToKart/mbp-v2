"use client";

import { motion } from "@/lib/motion";
import StatCard from "@/components/admin/StatCard";
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
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function AdminDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Posts",
      value: "124",
      change: 12.5,
      icon: DocumentTextIcon,
      iconColor: "bg-blue-500",
      trend: "up" as const,
    },
    {
      title: "Total Views",
      value: "45.2K",
      change: 8.3,
      icon: EyeIcon,
      iconColor: "bg-green-500",
      trend: "up" as const,
    },
    {
      title: "Active Users",
      value: "2,847",
      change: 15.2,
      icon: UserGroupIcon,
      iconColor: "bg-purple-500",
      trend: "up" as const,
    },
    {
      title: "Comments",
      value: "892",
      change: -3.1,
      icon: ChatBubbleLeftRightIcon,
      iconColor: "bg-orange-500",
      trend: "down" as const,
    },
  ];

  const recentPosts = [
    {
      id: 1,
      title: "New Community Health Program Launched",
      status: "published",
      views: 1234,
      date: "2 hours ago",
      category: "Announcements",
    },
    {
      id: 2,
      title: "Budget Report Q4 2024",
      status: "draft",
      views: 0,
      date: "5 hours ago",
      category: "Transparency",
    },
    {
      id: 3,
      title: "Upcoming Town Hall Meeting",
      status: "published",
      views: 856,
      date: "1 day ago",
      category: "Events",
    },
    {
      id: 4,
      title: "Road Maintenance Schedule Update",
      status: "published",
      views: 2341,
      date: "2 days ago",
      category: "Public Services",
    },
  ];

  const activities = [
    {
      action: "New post published",
      user: "Admin User",
      time: "10 minutes ago",
    },
    { action: "Comment approved", user: "John Doe", time: "1 hour ago" },
    { action: "User registered", user: "Jane Smith", time: "2 hours ago" },
    { action: "Post edited", user: "Admin User", time: "3 hours ago" },
    { action: "Category created", user: "Admin User", time: "5 hours ago" },
  ];

  // Mock chart data
  const viewsData = [
    { month: "Jan", views: 4000 },
    { month: "Feb", views: 3000 },
    { month: "Mar", views: 5000 },
    { month: "Apr", views: 4500 },
    { month: "May", views: 6000 },
    { month: "Jun", views: 5500 },
  ];

  const maxViews = Math.max(...viewsData.map((d) => d.views));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor your municipal portal performance and activity
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="lg" className="gap-2 shadow-lg">
            <PlusIcon className="w-5 h-5" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Views Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Page Views</CardTitle>
                  <CardDescription>Monthly view statistics</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  +12.5%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between gap-4 p-4">
                {viewsData.map((data, index) => {
                  const height = (data.views / maxViews) * 100;
                  return (
                    <motion.div
                      key={data.month}
                      className="flex-1 flex flex-col items-center gap-3"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    >
                      <div className="relative w-full h-full group flex items-end">
                        <motion.div
                          className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-400 transition-all relative"
                          style={{ height: `${height}%`, minHeight: "40px" }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.6 + index * 0.1,
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-primary rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap shadow-xl z-10">
                            {data.views.toLocaleString()} views
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {data.month}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Your latest published content</CardDescription>
              </div>
              <Link href="/admin/posts">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge
                            variant={
                              post.status === "published"
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {post.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {post.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {post.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
