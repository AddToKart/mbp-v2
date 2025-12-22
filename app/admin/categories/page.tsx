"use client";

import { useState, useEffect } from "react";
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
  Squares2X2Icon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useValidation } from "@/hooks/useValidation";
import { categorySchema, CategoryFormData } from "@/lib/schemas";

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

export default function AdminCategoriesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  const { errors, validate, validateField, clearErrors, setErrors } =
    useValidation(categorySchema);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      fetchCategories();
    }
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
    if (!isAuthenticated) return;

    if (!validate(formData)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingId
        ? `${API_BASE_URL}/admin/categories/${editingId}`
        : `${API_BASE_URL}/admin/categories`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this category?") || !isAuthenticated)
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete category");
      }

      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            Manage content categories and topics
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="gap-2"
          disabled={isFormOpen && !editingId}
        >
          <PlusIcon className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/20 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>
                  {editingId ? "Edit Category" : "New Category"}
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "Update category details"
                    : "Create a new category for your posts"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, name: val });
                          validateField("name", val);
                        }}
                        placeholder="e.g., Public Health"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.color}
                          onChange={(e) =>
                            setFormData({ ...formData, color: e.target.value })
                          }
                          className="w-12 p-1 h-10 cursor-pointer"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, color: val });
                            validateField("color", val);
                          }}
                          placeholder="#000000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          className={errors.color ? "border-destructive" : ""}
                        />
                      </div>
                      {errors.color && (
                        <p className="text-xs text-destructive">
                          {errors.color}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          description: val,
                        });
                        validateField("description", val);
                      }}
                      placeholder="Brief description of this category..."
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CheckIcon className="w-4 h-4 mr-2" />
                    )}
                    {editingId ? "Update Category" : "Create Category"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow group relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: category.color }}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      /{category.slug}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {category.postCount} posts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {category.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8 p-0"
                >
                  <PencilSquareIcon className="w-4 h-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                  disabled={category.postCount > 0}
                  title={
                    category.postCount > 0
                      ? "Cannot delete category with posts"
                      : "Delete category"
                  }
                >
                  <TrashIcon
                    className={`w-4 h-4 ${category.postCount > 0
                        ? "text-muted-foreground"
                        : "text-destructive"
                      }`}
                  />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Squares2X2Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No categories found. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
