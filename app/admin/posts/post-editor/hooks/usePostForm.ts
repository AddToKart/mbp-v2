"use client";

import { useEffect, useState } from "react";
import type {
  PostFormData,
  AdminPostResponse,
  PostStatus,
  CategoryOption,
} from "../types";
import { API_BASE_URL } from "../constants";
import { slugify } from "../utils";
import { useValidation } from "@/hooks/useValidation";
import { postSchema } from "@/lib/schemas";
import { useToast } from "@/contexts/ToastContext";

interface UsePostFormProps {
  mode: "create" | "edit";
  postId?: string;
  token: string | null;
  userName?: string;
  categories: CategoryOption[];
}

interface UsePostFormReturn {
  formData: PostFormData;
  setFormData: React.Dispatch<React.SetStateAction<PostFormData>>;
  handleInputChange: (
    field: keyof PostFormData,
    value: string | string[]
  ) => void;
  isFetching: boolean;
  errors: Record<string, string | undefined>;
  validate: (data: Record<string, unknown>) => boolean;
  validateField: (field: string, value: unknown) => boolean;
  clearErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
}

const initialFormData: PostFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  featuredImage: "",
  status: "draft",
  scheduledDate: undefined,
  scheduledTime: undefined,
  author: "Admin User",
  metaTitle: "",
  metaDescription: "",
  slug: "",
};

export function usePostForm({
  mode,
  postId,
  token,
  userName,
  categories,
}: UsePostFormProps): UsePostFormReturn {
  const { showToast } = useToast();
  const { errors, validate, validateField, clearErrors, setErrors } =
    useValidation(postSchema);

  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [isFetching, setIsFetching] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Set author from user name
  useEffect(() => {
    if (userName) {
      setFormData((prev) => ({
        ...prev,
        author: userName,
      }));
    }
  }, [userName]);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0) {
      setFormData((prev) => {
        if (prev.category) {
          return prev;
        }
        return { ...prev, category: categories[0].slug };
      });
    }
  }, [categories]);

  // Load post for editing
  useEffect(() => {
    if (mode !== "edit" || !postId || !token) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function loadPost() {
      setIsFetching(true);

      try {
        const response = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load the post for editing");
        }

        const data = (await response.json()) as AdminPostResponse;
        if (!isMounted) {
          return;
        }

        let scheduledDate: string | undefined;
        let scheduledTime: string | undefined;
        if (data.scheduledAt) {
          const scheduled = new Date(data.scheduledAt);
          if (!Number.isNaN(scheduled.getTime())) {
            scheduledDate = scheduled.toISOString().slice(0, 10);
            scheduledTime = scheduled.toISOString().slice(11, 16);
          }
        }

        setFormData({
          title: data.title,
          excerpt: data.excerpt ?? "",
          content: data.content ?? "",
          category: data.categorySlug ?? data.categoryName ?? "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          featuredImage: data.featuredImage ?? "",
          status: data.status ?? "draft",
          scheduledDate,
          scheduledTime,
          author: data.authorName ?? "Admin User",
          metaTitle: "",
          metaDescription: "",
          slug: data.slug ?? "",
        });
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unexpected error while loading the post";
        showToast(message, { type: "error" });
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    loadPost();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [mode, postId, token, showToast]);

  const handleInputChange = (
    field: keyof PostFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate field if it exists in the schema
    if (
      field !== "scheduledDate" &&
      field !== "scheduledTime" &&
      field !== "metaTitle" &&
      field !== "metaDescription" &&
      field !== "author"
    ) {
      validateField(field as any, value);
    }

    if (field === "title") {
      const slug = slugify(value.toString());
      setFormData((prev) => ({ ...prev, slug }));
      validateField("slug" as any, slug);
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

  return {
    formData,
    setFormData,
    handleInputChange,
    isFetching,
    errors,
    validate: validate as unknown as (data: Record<string, unknown>) => boolean,
    validateField: validateField as unknown as (
      field: string,
      value: unknown
    ) => boolean,
    clearErrors,
    setErrors,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
  };
}
