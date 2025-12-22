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
  ListBulletIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { revalidatePosts } from "@/app/actions";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useQueryClient } from "@tanstack/react-query";

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
type ViewMode = "list" | "card";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminPostsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<PostStatusFilter>("all");
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  // View & Pagination state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Unable to load posts");

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
      const message = requestError instanceof Error ? requestError.message : "Unexpected issue loading posts";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;
    fetchPosts();
  }, [isLoading, fetchPosts]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFilter]);

  const filteredPosts = useMemo(() => {
    const loweredQuery = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = selectedFilter === "all" || post.status === selectedFilter;
      if (!matchesFilter) return false;
      if (!loweredQuery) return true;

      return (
        post.title.toLowerCase().includes(loweredQuery) ||
        (post.excerpt || "").toLowerCase().includes(loweredQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(loweredQuery))
      );
    });
  }, [posts, searchQuery, selectedFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, page, pageSize]);

  const statusCounts = useMemo(() => ({
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
  }), [posts]);

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "Not published";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Not published";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete || !isAuthenticated) return;

    setIsDeleting(postToDelete);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/${postToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      await revalidatePosts();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPosts((prev) => prev.filter((post) => post.id !== postToDelete));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete post";
      setError(message);
    } finally {
      setIsDeleting(null);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-600 text-white border-0";
      case "draft":
        return "bg-slate-500 text-white border-0";
      case "scheduled":
        return "bg-blue-600 text-white border-0";
      default:
        return "bg-muted text-muted-foreground border-0";
    }
  };

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, filteredPosts.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Posts Management</h1>
          <p className="text-muted-foreground">Create, review, and publish municipal announcements</p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="lg" className="gap-2 shadow-lg">
            <PlusIcon className="w-5 h-5" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-0 bg-muted/50 focus-visible:bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
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

              <div className="h-6 w-px bg-border" />

              {/* Status Filters */}
              <div className="flex items-center gap-1">
                {FILTERS.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="h-8 gap-1.5"
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 border-0 ${selectedFilter === filter ? "bg-primary-foreground/20" : ""}`}>
                      {statusCounts[filter] ?? 0}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                {isFetching ? "Loading posts" : `${filteredPosts.length} post${filteredPosts.length !== 1 ? "s" : ""} found`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchPosts} disabled={isFetching}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10">{error}</div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div>
              <AnimatePresence mode="popLayout">
                {paginatedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="px-6 py-4 hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {post.title}
                          </h3>
                          <Badge className={`${getStatusColor(post.status)} capitalize text-[10px] h-5`}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt || "No excerpt"}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] h-5 border-0">{post.category}</Badge>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {post.authorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(post.publishedAt ?? post.createdAt)}
                          </span>
                          {post.status === "published" && (
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-3 h-3" />
                              {post.viewCount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/admin/posts/${post.id}`)}>
                          <PencilSquareIcon className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10" onClick={() => handleDeleteClick(post.id)} disabled={isDeleting === post.id}>
                          <TrashIcon className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {paginatedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card className="h-full shadow-sm border-0 bg-muted/30 hover:bg-muted/50 transition-colors group flex flex-col">
                      <CardContent className="p-4 flex flex-col flex-1">
                        {/* Header - Status & Actions */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Badge className={`${getStatusColor(post.status)} capitalize text-[10px] h-5`}>
                            {post.status}
                          </Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push(`/admin/posts/${post.id}`)}>
                              <PencilSquareIcon className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/10" onClick={() => handleDeleteClick(post.id)}>
                              <TrashIcon className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Content - Fixed height */}
                        <div className="flex-1 min-h-[80px]">
                          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.excerpt || "No excerpt"}</p>
                        </div>

                        {/* Footer - Fixed position at bottom */}
                        <div className="pt-3 mt-auto border-t border-border/50 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 truncate">
                              <UserIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{post.authorName}</span>
                            </span>
                            <Badge variant="secondary" className="text-[10px] h-5 border-0 shrink-0">{post.category}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                              {formatDate(post.publishedAt ?? post.createdAt)}
                            </span>
                            {post.status === "published" && (
                              <span className="flex items-center gap-1">
                                <EyeIcon className="w-3.5 h-3.5" />
                                {post.viewCount.toLocaleString()} views
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {!isFetching && paginatedPosts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">No posts found matching your criteria</p>
              <Button variant="secondary" onClick={() => { setSearchQuery(""); setSelectedFilter("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isFetching && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-lg">Fetching latest posts…</p>
            </div>
          )}

          {/* Pagination */}
          {!isFetching && filteredPosts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-muted/20 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {filteredPosts.length} posts
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="h-8 rounded-md bg-background px-2 text-sm border-0 shadow-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground">
                    {page} / {totalPages || 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Move to Recycle Bin?"
        message="This post will be moved to the Recycle Bin. You can restore it later if needed."
        confirmText="Move to Trash"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting === postToDelete}
      />
    </div>
  );
}
