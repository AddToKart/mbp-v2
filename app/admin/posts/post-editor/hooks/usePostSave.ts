"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PostFormData, PostStatus, PolicyWarning } from "../types";
import { API_BASE_URL } from "../constants";
import { slugify, fileToDataUrl } from "../utils";
import { useToast } from "@/contexts/ToastContext";
import { revalidatePosts } from "@/app/actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface UsePostSaveProps {
  mode: "create" | "edit";
  postId?: string;
  token: string | null;
  formData: PostFormData;
  setFormData: React.Dispatch<React.SetStateAction<PostFormData>>;
  validate: (data: Record<string, unknown>) => boolean;
  policyWarnings: PolicyWarning[];
}

interface UsePostSaveReturn {
  isSaving: boolean;
  handleSave: (statusOverride?: PostStatus) => Promise<void>;
  handleForcePublish: () => Promise<void>;
  imageError: string | null;
  setImageError: (error: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function usePostSave({
  mode,
  postId,
  token,
  formData,
  setFormData,
  validate,
  policyWarnings,
}: UsePostSaveProps): UsePostSaveReturn {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleSave = async (statusOverride?: PostStatus) => {
    console.log("handleSave called with statusOverride:", statusOverride);
    console.log("formData:", formData);

    if (!token) {
      console.log("No token found");
      showToast("Your session has expired. Please sign in again.", {
        type: "error",
      });
      return;
    }

    if (mode === "edit" && !postId) {
      showToast("Missing post identifier.", { type: "error" });
      return;
    }

    const targetStatus = statusOverride ?? formData.status;

    // Construct payload for validation
    let scheduledAt: string | null = null;
    if (targetStatus === "scheduled" && formData.scheduledDate) {
      scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime || "00:00"}:00`
      ).toISOString();
    }

    const sanitizedTags = formData.tags
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: slugify(formData.slug || formData.title),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      category: formData.category,
      status: targetStatus,
      tags: sanitizedTags,
      featuredImage: formData.featuredImage || undefined,
      scheduledAt,
    };

    // Manual validation with specific toast messages
    const validationErrors: string[] = [];
    console.log("Starting validation...");
    console.log(
      "payload.title:",
      payload.title,
      "length:",
      payload.title?.length
    );
    console.log(
      "payload.content:",
      payload.content,
      "length:",
      payload.content?.length
    );
    console.log("payload.category:", payload.category);

    if (!payload.title || payload.title.trim().length === 0) {
      validationErrors.push("Title is required");
    } else if (payload.title.length < 5) {
      validationErrors.push("Title must be at least 5 characters");
    }

    if (!payload.content || payload.content.trim().length === 0) {
      validationErrors.push("Content is required");
    } else if (payload.content.length < 20) {
      validationErrors.push("Content must be at least 20 characters");
    }

    if (!payload.category) {
      validationErrors.push("Category is required");
    }

    console.log("validationErrors:", validationErrors);

    // Also run schema validation for any additional checks
    const isSchemaValid = validate(payload);
    console.log("isSchemaValid:", isSchemaValid);

    if (validationErrors.length > 0 || !isSchemaValid) {
      console.log("Validation failed, showing toast...");
      // Show validation errors as a single toast with all issues
      if (validationErrors.length > 0) {
        const errorMessage =
          validationErrors.length === 1
            ? validationErrors[0]
            : `Please fix these issues:\n• ${validationErrors.join("\n• ")}`;
        console.log("Calling showToast with:", errorMessage);
        showToast(errorMessage, { type: "error" });
        console.log("showToast called");
      } else {
        // Show generic error if schema validation failed but we don't have specific errors
        showToast("Please fix the validation errors before saving.", {
          type: "warning",
        });
      }
      return;
    }

    // Check policy warnings for publishing
    const hasCriticalWarnings = policyWarnings.some(
      (warning) => warning.severity === "critical"
    );
    console.log("policyWarnings:", policyWarnings);
    console.log("hasCriticalWarnings:", hasCriticalWarnings);
    console.log("targetStatus:", targetStatus);

    if (targetStatus === "published" && hasCriticalWarnings) {
      const criticalIssues = policyWarnings
        .filter((w) => w.severity === "critical")
        .map((w) => w.message);
      const errorMsg =
        criticalIssues.length === 1
          ? `Cannot publish: ${criticalIssues[0]}`
          : `Cannot publish due to quality issues:\n• ${criticalIssues.join("\n• ")}`;
      console.log("Showing policy warning toast:", errorMsg);
      showToast(errorMsg, { type: "warning" });
      return;
    }

    setIsSaving(true);
    setFormData((prev) => ({ ...prev, status: targetStatus }));

    const endpoint =
      mode === "edit"
        ? `${API_BASE_URL}/admin/posts/${postId}`
        : `${API_BASE_URL}/admin/posts`;
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(errorData?.message ?? "Failed to save post");
      }

      await revalidatePosts();

      showToast(
        mode === "edit"
          ? "Post updated successfully!"
          : "Post created successfully!",
        { type: "success" }
      );
      router.push("/admin/posts");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unexpected error while saving";
      showToast(message, { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleForcePublish = async () => {
    if (!token) {
      showToast("Your session has expired. Please sign in again.", {
        type: "error",
      });
      return;
    }

    if (mode === "edit" && !postId) {
      showToast("Missing post identifier.", { type: "error" });
      return;
    }

    // Only validate required fields, skip quality checks
    if (!formData.title.trim()) {
      showToast("Title is required.", { type: "warning" });
      return;
    }

    if (!formData.category) {
      showToast("Category is required.", { type: "warning" });
      return;
    }

    // Construct payload
    const sanitizedTags = formData.tags
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: slugify(formData.slug || formData.title),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      category: formData.category,
      status: "published" as PostStatus,
      tags: sanitizedTags,
      featuredImage: formData.featuredImage || undefined,
      scheduledAt: null,
    };

    setIsSaving(true);
    setFormData((prev) => ({ ...prev, status: "published" }));

    const endpoint =
      mode === "edit"
        ? `${API_BASE_URL}/admin/posts/${postId}`
        : `${API_BASE_URL}/admin/posts`;
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(errorData?.message ?? "Failed to save post");
      }

      await revalidatePosts();

      showToast("Post force published successfully!", { type: "success" });
      router.push("/admin/posts");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unexpected error while saving";
      showToast(message, { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be 5MB or smaller.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setFormData((prev) => ({ ...prev, featuredImage: dataUrl }));
      setImageError(null);
    } catch (conversionError) {
      setImageError(
        conversionError instanceof Error
          ? conversionError.message
          : "Could not process image"
      );
    }
  };

  return {
    isSaving,
    handleSave,
    handleForcePublish,
    imageError,
    setImageError,
    handleImageUpload,
  };
}
