import { z } from "zod";
import {
  MAX_TITLE_LENGTH,
  MAX_EXCERPT_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS_COUNT,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  SafeUrlSchema,
} from "@/types/shared";

// --- Shared Constants ---
export const COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// --- Category Schemas ---
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .regex(COLOR_REGEX, "Must be a valid hex color code (e.g., #FF0000)")
    .default("#3b82f6"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// --- Post Schemas ---
export const postSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(
      MAX_TITLE_LENGTH,
      `Title must be less than ${MAX_TITLE_LENGTH} characters`
    )
    .trim(),
  slug: z
    .string()
    .regex(
      SLUG_REGEX,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional()
    .or(z.literal("")),
  excerpt: z
    .string()
    .max(
      MAX_EXCERPT_LENGTH,
      `Excerpt must be less than ${MAX_EXCERPT_LENGTH} characters`
    )
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(1, "Content is required")
    .max(MAX_CONTENT_LENGTH, "Content is too long"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "published", "scheduled"]),
  scheduledAt: z.string().datetime().optional().nullable(),
  featuredImage: SafeUrlSchema,
  tags: z
    .array(z.string().max(MAX_TAG_LENGTH))
    .max(MAX_TAGS_COUNT, `Maximum ${MAX_TAGS_COUNT} tags allowed`)
    .default([]),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(MAX_EMAIL_LENGTH),
  password: z.string().min(1, "Password is required").max(MAX_PASSWORD_LENGTH),
});

export type PostFormData = z.infer<typeof postSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// --- User Schemas ---
export const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(
      MAX_NAME_LENGTH,
      `Name must be less than ${MAX_NAME_LENGTH} characters`
    )
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(MAX_EMAIL_LENGTH)
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    )
    .max(MAX_PASSWORD_LENGTH, "Password is too long")
    .optional()
    .or(z.literal("")), // Optional for edits
});

export type UserFormData = z.infer<typeof userSchema>;
