import { env } from "./env";
import { PublicPost } from "@/types/shared";

const API_BASE_URL = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: string;
  tags: string[];
  viewCount?: number;
  author: {
    name: string;
    role: string;
  };
}

export interface PostDetail extends PostSummary {
  content: string;
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Unscheduled";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Unscheduled"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function computeReadTime(text: string | undefined): string {
  if (!text) return "1 min read";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function resolveImage(url: string | null | undefined): string {
  if (!url) return "/placeholder-image.svg";
  if (
    url.startsWith("http") ||
    url.startsWith("/") ||
    url.startsWith("data:image/")
  )
    return url;
  return "/placeholder-image.svg";
}

function mapToSummary(
  post: PublicPost,
  options: { readTimeSource?: string }
): PostSummary {
  const { readTimeSource } = options;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: resolveImage(post.featuredImage),
    category: post.category,
    categorySlug: post.categorySlug,
    date: formatDate(post.publishedAt ?? post.createdAt),
    readTime: computeReadTime(readTimeSource ?? post.excerpt),
    tags: post.tags ?? [],
    viewCount: post.viewCount ?? 0,
    author: { name: post.authorName, role: "Municipal Administration" },
  };
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(buildUrl(path), {
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
      next: { revalidate: 60 }, // Cache for 60 seconds
      ...init,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Request to ${path} failed with ${response.status}: ${body || "unknown error"}`
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[posts] Network error while requesting ${path}`, error);
    throw error;
  }
}

export async function fetchPostSummaries(limit = 30): Promise<PostSummary[]> {
  try {
    const url = new URL(buildUrl("/posts"));
    if (limit) url.searchParams.set("limit", String(limit));

    const data = await fetchJson<PublicPost[]>(`/posts${url.search}`);
    return data.map((post) =>
      mapToSummary(post, { readTimeSource: post.excerpt })
    );
  } catch (error) {
    console.error("Failed to fetch public post summaries", error);
    return [];
  }
}

export async function fetchPostDetail(
  slug: string
): Promise<PostDetail | null> {
  if (!slug) return null;
  try {
    const data = await fetchJson<PublicPost>(`/posts/${slug}`);
    const summary = mapToSummary(data, { readTimeSource: data.content });
    return {
      ...summary,
      content: data.content ?? "",
      readTime: computeReadTime(data.content ?? data.excerpt),
    };
  } catch (error) {
    console.error(`Failed to fetch post detail for slug "${slug}"`, error);
    return null;
  }
}

/**
 * Records a view for a post.
 * - For logged-in users: Pass the userId to track 1 view per user per post (lifetime)
 * - For guests: Pass no userId to track 1 view per IP per post per day
 *
 * @returns Object with success status, whether it was a new view, and updated view count
 */
export async function recordPostView(
  slug: string,
  userId?: number
): Promise<{ success: boolean; isNewView: boolean; viewCount: number } | null> {
  if (!slug) return null;
  try {
    const response = await fetch(buildUrl(`/posts/${slug}/view`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ userId }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Failed to record view for post "${slug}"`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error recording view for post "${slug}"`, error);
    return null;
  }
}
