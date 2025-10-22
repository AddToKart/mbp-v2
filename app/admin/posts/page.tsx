"use client";

import { useState } from "react";
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
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  status: "published" | "draft" | "scheduled";
  category: string;
  author: string;
  publishedDate: string;
  views: number;
  comments: number;
}

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "published" | "draft" | "scheduled"
  >("all");

  // Mock posts data
  const posts: Post[] = [
    {
      id: 1,
      title: "New Community Health Program Launched",
      excerpt:
        "Comprehensive healthcare initiative now available for all residents...",
      status: "published",
      category: "Announcements",
      author: "Admin User",
      publishedDate: "2024-10-20",
      views: 1234,
      comments: 45,
    },
    {
      id: 2,
      title: "Budget Report Q4 2024",
      excerpt:
        "Detailed financial breakdown of municipal spending and revenue...",
      status: "draft",
      category: "Transparency",
      author: "Admin User",
      publishedDate: "2024-10-21",
      views: 0,
      comments: 0,
    },
    {
      id: 3,
      title: "Upcoming Town Hall Meeting",
      excerpt:
        "Join us for our quarterly town hall discussion about community projects...",
      status: "scheduled",
      category: "Events",
      author: "Admin User",
      publishedDate: "2024-10-25",
      views: 0,
      comments: 0,
    },
    {
      id: 4,
      title: "Road Maintenance Schedule Update",
      excerpt:
        "Important updates regarding ongoing road improvement projects...",
      status: "published",
      category: "Public Services",
      author: "Admin User",
      publishedDate: "2024-10-18",
      views: 2341,
      comments: 78,
    },
    {
      id: 5,
      title: "Environmental Protection Initiative",
      excerpt:
        "New green policies and sustainability programs launching this month...",
      status: "published",
      category: "Environment",
      author: "Admin User",
      publishedDate: "2024-10-15",
      views: 1876,
      comments: 92,
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || post.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-secondary/20 text-secondary-foreground border-secondary/30";
      case "draft":
        return "bg-muted text-muted-foreground border-border";
      case "scheduled":
        return "bg-accent/20 text-accent-foreground border-accent/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Posts Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your municipal announcements
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="lg" className="gap-2 shadow-lg">
            <PlusIcon className="w-5 h-5" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <FunnelIcon className="w-5 h-5 text-muted-foreground hidden sm:block" />
              {(["all", "published", "draft", "scheduled"] as const).map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="gap-2"
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <Badge
                      variant="secondary"
                      className={
                        selectedFilter === filter
                          ? "bg-primary-foreground/20"
                          : ""
                      }
                    >
                      {statusCounts[filter]}
                    </Badge>
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table/List */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                {filteredPosts.length} post
                {filteredPosts.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="p-6 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Title & Status */}
                      <div className="flex items-start gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </div>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Category:</span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">By:</span> {post.author}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {post.publishedDate}
                        </span>
                        {post.status === "published" && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-3 h-3" />
                              {post.views.toLocaleString()} views
                            </span>
                            <span>•</span>
                            <span>{post.comments} comments</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        title="Edit post"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        title="Delete post"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <motion.div
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted-foreground text-lg mb-4">
                  No posts found matching your criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
