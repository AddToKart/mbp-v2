"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  TagIcon,
  DocumentTextIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CalendarIcon,
  ChartBarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useValidation } from "@/hooks/useValidation";
import { categorySchema, CategoryFormData } from "@/lib/schemas";
import { useConfirmModal } from "@/components/ui/confirm-modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  createdAt: string;
}

type ViewMode = "list" | "card";

export default function AdminCategoriesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const { confirm, ConfirmModal } = useConfirmModal();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  const { errors, validate, validateField, clearErrors } = useValidation(categorySchema);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) fetchCategories();
  }, [authLoading, isAuthenticated]);

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated || !validate(formData)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingId
        ? `${API_BASE_URL}/admin/categories/${editingId}`
        : `${API_BASE_URL}/admin/categories`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save category");
      }

      await fetchCategories();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(category: Category) {
    if (category.postCount > 0) {
      alert(`Cannot delete "${category.name}" - it has ${category.postCount} posts assigned.`);
      return;
    }

    await confirm({
      title: `Delete "${category.name}"?`,
      message: "This action cannot be undone. Make sure no posts are assigned to this category.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${category.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete category");
        }

        setCategories(categories.filter((c) => c.id !== category.id));
      },
    });
  }

  function resetForm() {
    setFormData({ name: "", description: "", color: "#3b82f6" });
    setEditingId(null);
    setIsFormOpen(false);
    setError(null);
    clearErrors();
  }

  function handleEdit(category: Category) {
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setEditingId(category.id);
    setIsFormOpen(true);
    clearErrors();
  }

  // Stats & Filtered Data
  const stats = useMemo(() => ({
    total: categories.length,
    active: categories.filter((c) => c.postCount > 0).length,
    totalPosts: categories.reduce((acc, curr) => acc + curr.postCount, 0),
    empty: categories.filter((c) => c.postCount === 0).length,
  }), [categories]);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by post count (most used first)
  const sortedCategories = [...filteredCategories].sort((a, b) => b.postCount - a.postCount);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground">Organize your content with topics and themes</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2 shadow-lg">
          <PlusIcon className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.total}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <TagIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active (with posts)</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.active}</h3>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10">
                <ChartBarIcon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.totalPosts}</h3>
              </div>
              <div className="p-3 rounded-full bg-violet-500/10">
                <DocumentTextIcon className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empty Categories</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.empty}</h3>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <FolderIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <span className="text-sm text-muted-foreground hidden md:block">
                {filteredCategories.length} of {categories.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category List/Card View */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Category Directory</CardTitle>
          <CardDescription>Sorted by post count (most used first)</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {/* List View */}
          {viewMode === "list" && (
            <div>
              {sortedCategories.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>{searchQuery ? "No categories match your search" : "No categories yet"}</p>
                </div>
              ) : (
                sortedCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="px-6 py-4 hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      {/* Color Badge */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <Badge variant="secondary" className="text-[10px] h-5 border-0">/{category.slug}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{category.description || "No description"}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <DocumentTextIcon className="w-4 h-4" />
                          {category.postCount} {category.postCount === 1 ? "post" : "posts"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(category.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(category)}>
                          <PencilSquareIcon className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                          onClick={() => handleDelete(category)}
                          disabled={category.postCount > 0}
                        >
                          <TrashIcon className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {sortedCategories.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-muted-foreground">
                    <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{searchQuery ? "No categories match your search" : "No categories yet"}</p>
                  </div>
                ) : (
                  sortedCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card className="h-full border-0 bg-muted/30 hover:bg-muted/50 transition-colors group flex flex-col overflow-hidden">
                        {/* Color bar at top */}
                        <div className="h-1.5" style={{ backgroundColor: category.color }} />
                        <CardContent className="p-4 flex flex-col flex-1">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
                              <Badge variant="secondary" className="text-[10px] h-5 border-0 mt-1">/{category.slug}</Badge>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(category)}>
                                <PencilSquareIcon className="w-3.5 h-3.5 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-destructive/10"
                                onClick={() => handleDelete(category)}
                                disabled={category.postCount > 0}
                              >
                                <TrashIcon className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1 min-h-[2.5rem]">
                            {category.description || "No description provided."}
                          </p>

                          {/* Footer */}
                          <div className="pt-3 mt-auto border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <DocumentTextIcon className="w-3.5 h-3.5" />
                              {category.postCount} {category.postCount === 1 ? "post" : "posts"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {formatDate(category.createdAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update category details" : "Create a new category for your posts"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, name: val });
                  validateField("name", val);
                }}
                placeholder="e.g., Announcements"
                className={`border-0 bg-muted/50 ${errors.name ? "ring-2 ring-destructive" : ""}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 p-1 h-10 cursor-pointer border-0"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, color: val });
                    validateField("color", val);
                  }}
                  placeholder="#000000"
                  className={`flex-1 border-0 bg-muted/50 ${errors.color ? "ring-2 ring-destructive" : ""}`}
                />
              </div>
              {errors.color && <p className="text-xs text-destructive">{errors.color}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, description: val });
                  validateField("description", val);
                }}
                placeholder="Brief description of this category..."
                className={`border-0 bg-muted/50 ${errors.description ? "ring-2 ring-destructive" : ""}`}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={resetForm} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {ConfirmModal}
    </div>
  );
}
