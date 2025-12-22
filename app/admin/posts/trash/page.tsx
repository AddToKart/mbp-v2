"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  ArrowPathIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  ListBulletIcon,
  Squares2X2Icon,
  UserIcon,
  FolderIcon,
  CheckIcon,
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
  deletedAt: string;
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
  deletedAt: string;
}

type ViewMode = "list" | "card";
type TimeFilter = "all" | "today" | "week" | "month";

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function TrashPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkRestoreModalOpen, setBulkRestoreModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const fetchDeletedPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/trash`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Unable to load deleted posts");

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
        deletedAt: post.deletedAt,
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
    fetchDeletedPosts();
  }, [isLoading, fetchDeletedPosts]);

  // Filter by time
  const filterByTime = (post: Post): boolean => {
    if (timeFilter === "all") return true;
    const deletedDate = new Date(post.deletedAt);
    const now = new Date();

    if (timeFilter === "today") {
      return deletedDate.toDateString() === now.toDateString();
    }
    if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return deletedDate >= weekAgo;
    }
    if (timeFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return deletedDate >= monthAgo;
    }
    return true;
  };

  const filteredPosts = useMemo(() => {
    const loweredQuery = searchQuery.trim().toLowerCase();
    return posts
      .filter(filterByTime)
      .filter((post) => {
        if (!loweredQuery) return true;
        return (
          post.title.toLowerCase().includes(loweredQuery) ||
          (post.excerpt || "").toLowerCase().includes(loweredQuery) ||
          post.authorName.toLowerCase().includes(loweredQuery) ||
          post.category.toLowerCase().includes(loweredQuery)
        );
      })
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }, [posts, searchQuery, timeFilter]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayCount = posts.filter(p => new Date(p.deletedAt).toDateString() === now.toDateString()).length;
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekCount = posts.filter(p => new Date(p.deletedAt) >= weekAgo).length;
    const uniqueAuthors = new Set(posts.map(p => p.authorName)).size;

    return {
      total: posts.length,
      today: todayCount,
      thisWeek: weekCount,
      byAuthors: uniqueAuthors,
    };
  }, [posts]);

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
      ? "Unknown"
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatFullDate = (timestamp: string | null) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
      ? "Unknown"
      : date.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(timestamp);
  };

  // Selection handlers
  const toggleSelectPost = (postId: number) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const selectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
    }
  };

  // Single post actions
  const handleRestoreClick = (postId: number) => {
    setSelectedPost(postId);
    setRestoreModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!isAuthenticated || !selectedPost) return;

    setIsProcessing(selectedPost);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/${selectedPost}/restore`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to restore post");

      await revalidatePosts();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPosts((prev) => prev.filter((p) => p.id !== selectedPost));
    } catch (err) {
      alert("Failed to restore post");
    } finally {
      setIsProcessing(null);
      setRestoreModalOpen(false);
      setSelectedPost(null);
    }
  };

  const handleDeleteClick = (postId: number) => {
    setSelectedPost(postId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!isAuthenticated || !selectedPost) return;

    setIsProcessing(selectedPost);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/${selectedPost}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p.id !== selectedPost));
    } catch (err) {
      alert("Failed to delete post");
    } finally {
      setIsProcessing(null);
      setDeleteModalOpen(false);
      setSelectedPost(null);
    }
  };

  // Bulk actions
  const handleBulkRestore = async () => {
    if (!isAuthenticated || selectedPosts.size === 0) return;
    setIsBulkProcessing(true);

    try {
      const promises = Array.from(selectedPosts).map(postId =>
        fetch(`${API_BASE_URL}/admin/posts/${postId}/restore`, {
          method: "PUT",
          credentials: "include",
        })
      );
      await Promise.all(promises);
      await revalidatePosts();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPosts((prev) => prev.filter((p) => !selectedPosts.has(p.id)));
      setSelectedPosts(new Set());
    } catch (err) {
      alert("Failed to restore some posts");
    } finally {
      setIsBulkProcessing(false);
      setBulkRestoreModalOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!isAuthenticated || selectedPosts.size === 0) return;
    setIsBulkProcessing(true);

    try {
      const promises = Array.from(selectedPosts).map(postId =>
        fetch(`${API_BASE_URL}/admin/posts/${postId}/permanent`, {
          method: "DELETE",
          credentials: "include",
        })
      );
      await Promise.all(promises);
      setPosts((prev) => prev.filter((p) => !selectedPosts.has(p.id)));
      setSelectedPosts(new Set());
    } catch (err) {
      alert("Failed to delete some posts");
    } finally {
      setIsBulkProcessing(false);
      setBulkDeleteModalOpen(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!isAuthenticated || posts.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const promises = posts.map(post =>
        fetch(`${API_BASE_URL}/admin/posts/${post.id}/permanent`, {
          method: "DELETE",
          credentials: "include",
        })
      );
      await Promise.all(promises);
      setPosts([]);
      setSelectedPosts(new Set());
    } catch (err) {
      alert("Failed to empty trash");
    } finally {
      setIsBulkProcessing(false);
      setEmptyTrashModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm" className="gap-1 pl-0 text-muted-foreground hover:text-foreground">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Posts
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Recycle Bin</h1>
          <p className="text-muted-foreground">Manage deleted posts. Restore them or delete permanently.</p>
        </div>
        {posts.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setEmptyTrashModalOpen(true)}
            disabled={isBulkProcessing}
          >
            <TrashIcon className="w-4 h-4" />
            Empty Trash
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deleted</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.total}</h3>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deleted Today</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.today}</h3>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.thisWeek}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">By Authors</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.byAuthors}</h3>
              </div>
              <div className="p-3 rounded-full bg-violet-500/10">
                <UserIcon className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search deleted posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-0 bg-muted/50 focus-visible:bg-background"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end">
              {/* Time Filter */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="h-9 rounded-md bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer border-0"
              >
                {TIME_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

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

              {/* Refresh */}
              <Button variant="ghost" size="sm" onClick={fetchDeletedPosts} disabled={isFetching} className="h-9">
                <ArrowPathIcon className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedPosts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-primary/10 rounded-lg px-4 py-3"
        >
          <span className="text-sm font-medium">
            {selectedPosts.size} post{selectedPosts.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
              onClick={() => setBulkRestoreModalOpen(true)}
              disabled={isBulkProcessing}
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Restore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
              onClick={() => setBulkDeleteModalOpen(true)}
              disabled={isBulkProcessing}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedPosts(new Set())}>
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Deleted Posts</CardTitle>
              <CardDescription>
                {isFetching ? "Loading..." : `${filteredPosts.length} post${filteredPosts.length !== 1 ? "s" : ""} in trash`}
              </CardDescription>
            </div>
            {filteredPosts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAll} className="gap-2">
                <CheckIcon className="w-4 h-4" />
                {selectedPosts.size === filteredPosts.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div>
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`px-6 py-4 hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-0 ${selectedPosts.has(post.id) ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelectPost(post.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedPosts.has(post.id)
                            ? "bg-primary border-primary text-white"
                            : "border-muted-foreground/30 hover:border-primary"
                          }`}
                      >
                        {selectedPosts.has(post.id) && <CheckIcon className="w-3 h-3" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                          <Badge variant="secondary" className="text-[10px] h-5 border-0 shrink-0">
                            {post.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt || "No excerpt provided."}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrashIcon className="w-3 h-3" />
                            {getTimeAgo(post.deletedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {post.authorName}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                          onClick={() => handleRestoreClick(post.id)}
                          disabled={isProcessing === post.id}
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteClick(post.id)}
                          disabled={isProcessing === post.id}
                        >
                          <TrashIcon className="w-4 h-4" />
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
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card className={`h-full border-0 bg-muted/30 hover:bg-muted/50 transition-colors group flex flex-col ${selectedPosts.has(post.id) ? "ring-2 ring-primary" : ""}`}>
                      <CardContent className="p-4 flex flex-col flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <button
                            onClick={() => toggleSelectPost(post.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${selectedPosts.has(post.id)
                                ? "bg-primary border-primary text-white"
                                : "border-muted-foreground/30 hover:border-primary"
                              }`}
                          >
                            {selectedPosts.has(post.id) && <CheckIcon className="w-3 h-3" />}
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-100"
                              onClick={() => handleRestoreClick(post.id)}
                            >
                              <ArrowPathIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-100"
                              onClick={() => handleDeleteClick(post.id)}
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-[80px]">
                          <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.excerpt || "No excerpt provided."}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 mt-auto border-t border-border/50 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <FolderIcon className="w-3.5 h-3.5" />
                              {post.category}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5" />
                              {post.authorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-destructive/70">
                            <TrashIcon className="w-3.5 h-3.5" />
                            Deleted {getTimeAgo(post.deletedAt)}
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
          {!isFetching && filteredPosts.length === 0 && (
            <div className="p-16 text-center">
              <ArchiveBoxXMarkIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-lg font-medium text-foreground mb-1">Recycle bin is empty</h3>
              <p className="text-muted-foreground">
                {searchQuery || timeFilter !== "all"
                  ? "No posts match your filters"
                  : "Deleted posts will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ConfirmModal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onConfirm={handleConfirmRestore}
        title="Restore Post"
        message="This post will be moved back to the main posts list as a draft."
        confirmText="Restore"
        cancelText="Cancel"
        variant="success"
        isLoading={isProcessing === selectedPost}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Forever?"
        message="This action cannot be undone. The post will be permanently removed."
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing === selectedPost}
      />

      <ConfirmModal
        isOpen={bulkRestoreModalOpen}
        onClose={() => setBulkRestoreModalOpen(false)}
        onConfirm={handleBulkRestore}
        title={`Restore ${selectedPosts.size} Post${selectedPosts.size !== 1 ? "s" : ""}?`}
        message="Selected posts will be moved back to the main posts list."
        confirmText="Restore All"
        cancelText="Cancel"
        variant="success"
        isLoading={isBulkProcessing}
      />

      <ConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedPosts.size} Post${selectedPosts.size !== 1 ? "s" : ""} Forever?`}
        message="This action cannot be undone. Selected posts will be permanently removed."
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkProcessing}
      />

      <ConfirmModal
        isOpen={emptyTrashModalOpen}
        onClose={() => setEmptyTrashModalOpen(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Recycle Bin?"
        message={`This will permanently delete all ${posts.length} post${posts.length !== 1 ? "s" : ""} in the trash. This action cannot be undone.`}
        confirmText="Empty Trash"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkProcessing}
      />
    </div>
  );
}
