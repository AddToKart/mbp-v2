"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  status: "published" | "draft" | "scheduled";
  category: string;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
  tags: string[];
}

interface AdminPostResponse {
  id: number;
  title: string;
  excerpt: string;
  status: "published" | "draft" | "scheduled";
  categorySlug: string;
  categoryName?: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
  tags: string[];
}

const FILTERS = ["all", "published", "draft", "scheduled"] as const;

type PostStatusFilter = (typeof FILTERS)[number];

export default function AdminPostsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<PostStatusFilter>("all");
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pull latest admin posts from Fastify backend using stored JWT token
  const fetchPosts = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load posts");
      }

      const data = (await response.json()) as AdminPostResponse[];
      const normalized = data.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        status: post.status,
        category: post.categoryName ?? post.categorySlug ?? "Uncategorized",
        authorName: post.authorName,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        viewCount: post.viewCount ?? 0,
        tags: post.tags ?? [],
      }));
      setPosts(normalized);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unexpected issue loading posts";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    const loweredQuery = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const loweredExcerpt = (post.excerpt || "").toLowerCase();
      const matchesFilter =
        selectedFilter === "all" || post.status === selectedFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!loweredQuery) {
        return true;
      }

      const matchesSearch =
        post.title.toLowerCase().includes(loweredQuery) ||
        loweredExcerpt.includes(loweredQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(loweredQuery));
      return matchesSearch;
    });
  }, [posts, searchQuery, selectedFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
    } as Record<PostStatusFilter, number>;
  }, [posts]);

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) {
      return "Not published";
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return "Not published";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (postId: number) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(postId);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete post";
      setError(message);
    } finally {
      setIsDeleting(null);
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Posts Management
          </h1>
          <p className="text-muted-foreground">
            Create, review, and publish municipal announcements
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

            <div className="flex items-center gap-2 flex-wrap">
              <FunnelIcon className="w-5 h-5 text-muted-foreground hidden sm:block" />
              {FILTERS.map((filter) => (
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
                    {statusCounts[filter] ?? 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                {isFetching
                  ? "Loading posts"
                  : `${filteredPosts.length} post${
                      filteredPosts.length !== 1 ? "s" : ""
                    } found`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPosts}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {error && (
              <motion.div
                className="p-4 text-sm text-destructive bg-destructive/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

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
                      <div className="flex items-start gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <Badge
                          className={`${getStatusColor(post.status)} capitalize shadow-sm`}
                        >
                          {post.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt || "No excerpt provided."}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Category:</span>
                          <Badge variant="outline" className="text-xs">
                            {post.category || "Uncategorized"}
                          </Badge>
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">By:</span>{" "}
                          {post.authorName || "Unknown"}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                        {post.status === "published" && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-3 h-3" />
                              {post.viewCount?.toLocaleString?.() ?? 0} views
                            </span>
                          </>
                        )}
                        {post.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-2">
                              <span className="font-medium">Tags:</span>
                              {post.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:!bg-blue-600 hover:!text-white transition-colors"
                        onClick={() => router.push(`/admin/posts/${post.id}`)}
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:!bg-red-600 hover:!text-white transition-colors"
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting === post.id}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isFetching && filteredPosts.length === 0 && (
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

            {isFetching && (
              <motion.div
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted-foreground text-lg">
                  Fetching latest posts…
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
