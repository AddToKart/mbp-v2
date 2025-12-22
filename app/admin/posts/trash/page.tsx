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
  ArrowPathIcon,
  TrashIcon,
  ArrowLeftIcon,
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

export default function TrashPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const fetchDeletedPosts = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/trash`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load deleted posts");
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
        deletedAt: post.deletedAt,
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;
    fetchDeletedPosts();
  }, [isLoading, fetchDeletedPosts]);

  const filteredPosts = useMemo(() => {
    const loweredQuery = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (!loweredQuery) {
        return true;
      }
      return (
        post.title.toLowerCase().includes(loweredQuery) ||
        (post.excerpt || "").toLowerCase().includes(loweredQuery)
      );
    });
  }, [posts, searchQuery]);

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
      ? "Unknown"
      : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  };

  const handleRestoreClick = (postId: number) => {
    setSelectedPost(postId);
    setRestoreModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!isAuthenticated || !selectedPost) return;

    setIsProcessing(selectedPost);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/posts/${selectedPost}/restore`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to restore post");

      await revalidatePosts();
      // Invalidate client-side TanStack Query cache for posts
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
      const response = await fetch(
        `${API_BASE_URL}/admin/posts/${selectedPost}/permanent`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm" className="gap-1 pl-0">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Posts
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Recycle Bin</h1>
          <p className="text-muted-foreground">
            Manage deleted posts. Restore them or delete permanently.
          </p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search deleted posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deleted Posts</CardTitle>
              <CardDescription>
                {isFetching
                  ? "Loading..."
                  : `${filteredPosts.length} deleted post${filteredPosts.length !== 1 ? "s" : ""
                  } found`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDeletedPosts}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10">
                {error}
              </div>
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
                        <h3 className="text-lg font-semibold text-foreground">
                          {post.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt || "No excerpt provided."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>
                          <span className="font-medium">Deleted:</span>{" "}
                          {formatDate(post.deletedAt)}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Author:</span>{" "}
                          {post.authorName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleRestoreClick(post.id)}
                        disabled={isProcessing === post.id}
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(post.id)}
                        disabled={isProcessing === post.id}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isFetching && filteredPosts.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  Recycle bin is empty
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onConfirm={handleConfirmRestore}
        title="Restore Post"
        message="Are you sure you want to restore this post? It will be moved back to the main posts list."
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
        message="This action cannot be undone. The post will be permanently removed from the database."
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing === selectedPost}
      />
    </div>
  );
}
