"use client";

import { useEffect, useState } from "react";
import type { CategoryOption } from "../types";
import { API_BASE_URL } from "../constants";

interface UseCategoriesReturn {
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  categoryError: string | null;
}

export function useCategories(isAuthenticated: boolean): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setCategories([]);
      setIsLoadingCategories(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function loadCategories() {
      setIsLoadingCategories(true);
      setCategoryError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
          credentials: "include",
          signal: controller.signal,
        });

        const rawBody = await response.text();

        if (!response.ok) {
          let message = "Unable to load categories";
          try {
            const parsed = JSON.parse(rawBody) as { message?: string };
            message = parsed?.message ?? message;
          } catch {
            // ignore parse issues
          }
          throw new Error(message);
        }

        const data = rawBody ? (JSON.parse(rawBody) as CategoryOption[]) : [];

        if (!isMounted) {
          return;
        }

        setCategories(data);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load categories";
        setCategoryError(message);
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAuthenticated]);

  return { categories, isLoadingCategories, categoryError };
}
