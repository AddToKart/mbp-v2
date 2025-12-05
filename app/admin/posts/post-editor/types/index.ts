// Post Editor Types and Interfaces

export type PostStatus = "draft" | "published" | "scheduled";

export interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  status: PostStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export interface AdminPostResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  categoryName: string;
  status: PostStatus;
  tags: string[];
  authorName: string;
  scheduledAt: string | null;
  createdAt: string;
  publishedAt: string | null;
  featuredImage?: string | null;
}

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

export interface PolicyWarning {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface RecommendedSchedule {
  date: string;
  time: string;
  label: string;
  rationale: string;
}

export interface AssistantResult {
  title?: string;
  excerpt?: string;
  content?: string;
  callToAction?: string;
  highlights?: string[];
}

export interface PostEditorProps {
  mode: "create" | "edit";
  postId?: string;
}

export type LanguageOption = "English" | "Tagalog" | "Taglish";
