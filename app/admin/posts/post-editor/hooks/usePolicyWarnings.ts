"use client";

import { useMemo } from "react";
import type {
  PolicyWarning,
  PostFormData,
  RecommendedSchedule,
} from "../types";
import { countWords } from "../utils";

interface UsePolicyWarningsProps {
  formData: PostFormData;
}

interface UsePolicyWarningsReturn {
  policyWarnings: PolicyWarning[];
  policyScore: number;
  contentWordCount: number;
  excerptWordCount: number;
}

export function usePolicyWarnings({
  formData,
}: UsePolicyWarningsProps): UsePolicyWarningsReturn {
  const contentWordCount = useMemo(
    () => countWords(formData.content),
    [formData.content]
  );

  const excerptWordCount = useMemo(
    () => countWords(formData.excerpt),
    [formData.excerpt]
  );

  const policyWarnings = useMemo<PolicyWarning[]>(() => {
    const warnings: PolicyWarning[] = [];

    // 1. Category Check (Critical)
    if (!formData.category) {
      warnings.push({
        id: "category-missing",
        message:
          "Select a category so residents know which department the update comes from.",
        severity: "critical",
      });
    }

    // 2. Title Checks
    if (formData.title.length < 10) {
      warnings.push({
        id: "title-short",
        message: "Title is too short. Aim for at least 10 characters.",
        severity: "critical",
      });
    } else if (formData.title.length > 100) {
      warnings.push({
        id: "title-long",
        message:
          "Title is too long. Keep it under 100 characters for better readability.",
        severity: "warning",
      });
    }

    const upperCaseCount = formData.title.replace(/[^A-Z]/g, "").length;
    if (
      formData.title.length > 0 &&
      upperCaseCount / formData.title.length > 0.7
    ) {
      warnings.push({
        id: "title-shouting",
        message: "Avoid using all caps in the title. It looks like shouting.",
        severity: "warning",
      });
    }

    // 3. Content Length Checks
    if (contentWordCount < 50) {
      warnings.push({
        id: "content-critical",
        message: "Content is too short. Provide more details (min. 50 words).",
        severity: "critical",
      });
    } else if (contentWordCount < 150) {
      warnings.push({
        id: "content-warning",
        message:
          "Consider expanding the content to at least 150 words for better engagement.",
        severity: "warning",
      });
    }

    // 4. Excerpt Checks
    if (excerptWordCount < 10) {
      warnings.push({
        id: "excerpt-short",
        message: "Excerpt is too short. Write a summary of at least 10 words.",
        severity: "warning",
      });
    } else if (excerptWordCount > 60) {
      warnings.push({
        id: "excerpt-long",
        message: "Excerpt is too long. Keep it under 60 words for list views.",
        severity: "info",
      });
    }

    // 5. Tags Check
    if (formData.tags.length < 2) {
      warnings.push({
        id: "tags-minimum",
        message:
          "Add at least two tags so residents can filter related topics.",
        severity: "warning",
      });
    }

    // 6. Featured Image Check
    if (!formData.featuredImage) {
      warnings.push({
        id: "featured-image",
        message:
          "Adding a featured image improves visibility on the announcements grid.",
        severity: "info",
      });
    }

    // 7. SEO Checks
    if (
      !formData.metaDescription ||
      formData.metaDescription.trim().length < 50
    ) {
      warnings.push({
        id: "meta-description",
        message:
          "Meta description should be at least 50 characters for search previews.",
        severity: "warning",
      });
    }

    if (!formData.slug) {
      warnings.push({
        id: "slug-missing",
        message: "A clean slug helps residents share links easily.",
        severity: "info",
      });
    }

    return warnings;
  }, [
    contentWordCount,
    excerptWordCount,
    formData.category,
    formData.featuredImage,
    formData.metaDescription,
    formData.slug,
    formData.tags.length,
    formData.title,
  ]);

  const policyScore = useMemo(() => {
    if (policyWarnings.length === 0) {
      return 100;
    }
    const penalty = policyWarnings.reduce((total, warning) => {
      if (warning.severity === "critical") {
        return total + 25;
      }
      if (warning.severity === "warning") {
        return total + 15;
      }
      return total + 8;
    }, 0);
    return Math.max(20, 100 - penalty);
  }, [policyWarnings]);

  return {
    policyWarnings,
    policyScore,
    contentWordCount,
    excerptWordCount,
  };
}

interface UseRecommendedScheduleProps {
  category: string;
  tagsLength: number;
}

export function useRecommendedSchedule({
  category,
  tagsLength,
}: UseRecommendedScheduleProps): RecommendedSchedule {
  return useMemo(() => {
    const now = new Date();
    const candidate = new Date(now);
    candidate.setSeconds(0, 0);

    const primeSlots = [9, 13, 18];
    const nextSlot = primeSlots.find((slot) => now.getHours() < slot);

    if (typeof nextSlot === "number") {
      candidate.setHours(nextSlot, 0, 0, 0);
    } else {
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(primeSlots[0], 0, 0, 0);
    }

    while (candidate.getDay() === 0 || candidate.getDay() === 6) {
      candidate.setDate(candidate.getDate() + 1);
    }

    const labelFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const descriptor =
      candidate.getHours() < 12
        ? "morning community updates"
        : candidate.getHours() < 17
          ? "afternoon service coordination"
          : "evening recap window";

    const focus = category
      ? `${category.replace(/-/g, " ")} initiatives`
      : "general civic updates";

    return {
      date: candidate.toISOString().slice(0, 10),
      time: candidate.toISOString().slice(11, 16),
      label: labelFormatter.format(candidate),
      rationale: `Optimized for ${descriptor} focused on ${focus}.`,
    };
  }, [category, tagsLength]);
}
