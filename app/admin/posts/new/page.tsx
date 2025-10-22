"use client";

import { useState } from "react";
import { motion } from "@/lib/motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  PhotoIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  status: "draft" | "published" | "scheduled";
  scheduledDate?: string;
  scheduledTime?: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

const categories = [
  "Announcements",
  "News",
  "Events",
  "Public Services",
  "Transparency",
  "Environment",
  "Health",
  "Education",
  "Infrastructure",
  "Community",
];

export default function CreatePostPage() {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    featuredImage: "",
    status: "draft",
    author: "Admin User",
    metaTitle: "",
    metaDescription: "",
    slug: "",
  });

  const handleInputChange = (
    field: keyof PostFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === "title") {
      const slug = value
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to server and get URL
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, featuredImage: imageUrl }));
    }
  };

  const handleSave = async (status: PostFormData["status"]) => {
    setIsSaving(true);

    // Simulate API call
    const postData = {
      ...formData,
      status,
      publishedDate: new Date().toISOString(),
    };

    // TODO: Replace with actual API call
    console.log("Saving post:", postData);

    setTimeout(() => {
      setIsSaving(false);
      router.push("/admin/posts");
    }, 1000);
  };

  const getCharCount = (text: string, max: number) => {
    const count = text.length;
    const percentage = (count / max) * 100;
    const color =
      percentage > 90
        ? "text-red-500"
        : percentage > 70
        ? "text-yellow-500"
        : "text-green-500";
    return { count, color };
  };

  const titleCount = getCharCount(formData.title, 80);
  const excerptCount = getCharCount(formData.excerpt, 160);
  const metaDescCount = getCharCount(formData.metaDescription, 160);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Post
            </h1>
            <p className="text-muted-foreground mt-1">
              Share announcements and updates with your community
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="gap-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="gap-2 shadow-lg"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isSaving ? "Publishing..." : "Publish Now"}
          </Button>
        </div>
      </div>

      {!isPreview ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Excerpt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-primary" />
                    Post Details
                  </CardTitle>
                  <CardDescription>
                    Create compelling content for your audience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">
                        Title <span className="text-destructive">*</span>
                      </label>
                      <span
                        className={`text-xs font-medium ${titleCount.color}`}
                      >
                        {titleCount.count}/80
                      </span>
                    </div>
                    <Input
                      placeholder="Enter an engaging title..."
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="text-lg font-semibold h-12"
                      maxLength={80}
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        /posts/
                      </span>
                      <Input
                        placeholder="auto-generated-slug"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">
                        Excerpt <span className="text-destructive">*</span>
                      </label>
                      <span
                        className={`text-xs font-medium ${excerptCount.color}`}
                      >
                        {excerptCount.count}/160
                      </span>
                    </div>
                    <Textarea
                      placeholder="Brief summary of your post..."
                      value={formData.excerpt}
                      onChange={(e) =>
                        handleInputChange("excerpt", e.target.value)
                      }
                      className="resize-none h-20"
                      maxLength={160}
                    />
                  </div>

                  <Separator />

                  {/* Content */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Content <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Write your post content here... (In production, this would be a rich text editor)"
                      value={formData.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      className="resize-none min-h-[400px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Tip: In production, this will be replaced with a rich
                      text editor supporting formatting, images, and embeds.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhotoIcon className="w-5 h-5 text-primary" />
                    Featured Image
                  </CardTitle>
                  <CardDescription>
                    Add a cover image for your post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formData.featuredImage ? (
                    <div className="relative group">
                      <img
                        src={formData.featuredImage}
                        alt="Featured"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            featuredImage: "",
                          }))
                        }
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PhotoIcon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or WebP (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* SEO Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Optimize your post for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Meta Title
                    </label>
                    <Input
                      placeholder="SEO-optimized title..."
                      value={formData.metaTitle}
                      onChange={(e) =>
                        handleInputChange("metaTitle", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">
                        Meta Description
                      </label>
                      <span
                        className={`text-xs font-medium ${metaDescCount.color}`}
                      >
                        {metaDescCount.count}/160
                      </span>
                    </div>
                    <Textarea
                      placeholder="Description for search results..."
                      value={formData.metaDescription}
                      onChange={(e) =>
                        handleInputChange("metaDescription", e.target.value)
                      }
                      className="resize-none h-20"
                      maxLength={160}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          value: "draft",
                          label: "Draft",
                          icon: DocumentTextIcon,
                        },
                        {
                          value: "published",
                          label: "Publish",
                          icon: CheckCircleIcon,
                        },
                        {
                          value: "scheduled",
                          label: "Schedule",
                          icon: ClockIcon,
                        },
                      ].map((status) => (
                        <Button
                          key={status.value}
                          variant={
                            formData.status === status.value
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleInputChange(
                              "status",
                              status.value as PostFormData["status"]
                            )
                          }
                          className="flex flex-col items-center gap-1 h-auto py-3"
                        >
                          <status.icon className="w-4 h-4" />
                          <span className="text-xs">{status.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule Date/Time */}
                  {formData.status === "scheduled" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2"
                    >
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                          Schedule Date
                        </label>
                        <Input
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) =>
                            handleInputChange("scheduledDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                          Schedule Time
                        </label>
                        <Input
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) =>
                            handleInputChange("scheduledTime", e.target.value)
                          }
                        />
                      </div>
                    </motion.div>
                  )}

                  <Separator />

                  {/* Author */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Author
                    </label>
                    <Input
                      value={formData.author}
                      onChange={(e) =>
                        handleInputChange("author", e.target.value)
                      }
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                  <CardDescription>Select a category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>Add tags to categorize</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button
                      size="icon"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-8 space-y-6">
              {/* Preview Header */}
              <div className="text-center space-y-4">
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt={formData.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                )}
                <div className="space-y-2">
                  {formData.category && (
                    <Badge variant="secondary" className="text-sm">
                      {formData.category}
                    </Badge>
                  )}
                  <h1 className="text-4xl font-bold text-foreground">
                    {formData.title || "Untitled Post"}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {formData.excerpt || "No excerpt provided"}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>By {formData.author}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preview Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">
                  {formData.content || "No content yet..."}
                </p>
              </div>

              {/* Preview Tags */}
              {formData.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
