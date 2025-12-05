import { z } from "zod";

// --- Validation Constants ---
export const MAX_TITLE_LENGTH = 200;
export const MAX_EXCERPT_LENGTH = 500;
export const MAX_CONTENT_LENGTH = 100000; // 100KB of text
export const MAX_TAG_LENGTH = 50;
export const MAX_TAGS_COUNT = 20;
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254; // RFC 5321
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_PASSWORD_LENGTH = 8;

export const PublicPostSchema = z.object({
  id: z.number(),
  title: z.string().max(MAX_TITLE_LENGTH),
  slug: z.string(),
  excerpt: z.string().max(MAX_EXCERPT_LENGTH),
  content: z.string().max(MAX_CONTENT_LENGTH).optional(),
  categorySlug: z.string(),
  category: z.string(),
  status: z.string(),
  tags: z.array(z.string().max(MAX_TAG_LENGTH)).max(MAX_TAGS_COUNT),
  featuredImage: z.string().nullable().optional(),
  authorName: z.string(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  viewCount: z.number().optional(),
});

export type PublicPost = z.infer<typeof PublicPostSchema>;

export const LoginSchema = z.object({
  email: z.string().email().max(MAX_EMAIL_LENGTH).toLowerCase().trim(),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    role: z.literal("admin"),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Post Schemas
export const PostStatusSchema = z.enum(["draft", "published", "scheduled"]);

// Secure URL validation - only allows http, https, and safe data URIs
export const SafeUrlSchema = z
  .string()
  .max(10485760) // Increased limit to support base64 images (approx 10MB)
  .refine(
    (url) => {
      if (!url) return true;
      // Allow relative URLs
      if (url.startsWith("/") && !url.startsWith("//")) return true;
      // Allow http/https
      if (url.startsWith("http://") || url.startsWith("https://")) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      }
      // Allow data:image URIs
      if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(url)) return true;
      return false;
    },
    { message: "Invalid URL format" }
  )
  .optional();

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(
      MAX_TITLE_LENGTH,
      `Title must be less than ${MAX_TITLE_LENGTH} characters`
    )
    .trim(),
  slug: z
    .string()
    .max(MAX_TITLE_LENGTH)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    )
    .optional(),
  excerpt: z
    .string()
    .max(
      MAX_EXCERPT_LENGTH,
      `Excerpt must be less than ${MAX_EXCERPT_LENGTH} characters`
    )
    .default(""),
  content: z
    .string()
    .max(MAX_CONTENT_LENGTH, `Content is too long`)
    .default(""),
  category: z.string().min(1, "Category is required"),
  status: PostStatusSchema.default("draft"),
  tags: z
    .array(z.string().max(MAX_TAG_LENGTH).trim())
    .max(MAX_TAGS_COUNT, `Maximum ${MAX_TAGS_COUNT} tags allowed`)
    .default([]),
  featuredImage: SafeUrlSchema,
  scheduledAt: z.string().datetime().optional().nullable(),
});

export type CreatePostRequest = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = CreatePostSchema.partial();

export type UpdatePostRequest = z.infer<typeof UpdatePostSchema>;

// Category Schemas
const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .transform((value) => value?.trim()),
  color: z
    .string()
    .regex(colorRegex, "Color must be a valid hex code (e.g., #FF0000)")
    .optional(),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>;

// User Schemas
export const CreateUserSchema = z.object({
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
    .max(MAX_PASSWORD_LENGTH, "Password is too long"),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(MAX_NAME_LENGTH)
    .trim()
    .optional(),
  email: z
    .string()
    .email()
    .max(MAX_EMAIL_LENGTH)
    .toLowerCase()
    .trim()
    .optional(),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH)
    .max(MAX_PASSWORD_LENGTH)
    .optional()
    .or(z.literal("")),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
