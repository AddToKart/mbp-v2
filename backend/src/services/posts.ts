import { db } from "../db/client.js";
import { env } from "../env.js";

export type PostRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  categoryName: string | null;
  status: "draft" | "published" | "scheduled";
  tags: string;
  featuredImage: string | null;
  authorId: number;
  authorName: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  deletedAt: string | null;
};

export type PublicPostRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  categorySlug: string;
  categoryName: string | null;
  status: string;
  tags: string;
  featuredImage: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
};

// Simple in-memory cache for public endpoints. This reduces DB load
// during SSG or frequent public requests. TTL can be adjusted with
// `BACKEND_CACHE_TTL_SECONDS` env var (default 60s).
const CACHE_TTL = Number(process.env.BACKEND_CACHE_TTL_SECONDS) || 60;
type CacheEntry<T> = { expiresAt: number; value: T };
const publicPostsCache = new Map<string, CacheEntry<PublicPostRow[]>>();
const publicPostSlugCache = new Map<
  string,
  CacheEntry<PublicPostRow | undefined>
>();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ensureUniqueSlug(baseSlug: string, currentId?: number) {
  let slug = baseSlug;
  let suffix = 1;

  const query = currentId
    ? db.prepare("SELECT id FROM posts WHERE slug = ? AND id != ?")
    : db.prepare("SELECT id FROM posts WHERE slug = ?");

  while (true) {
    const existing = currentId ? query.get(slug, currentId) : query.get(slug);

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export function resolveCategorySlug(categoryInput: string) {
  const trimmed = categoryInput?.trim();

  if (!trimmed) {
    throw new Error("Category is required");
  }

  const directMatch = db
    .prepare("SELECT slug FROM categories WHERE slug = ?")
    .get(trimmed) as { slug: string } | undefined;

  if (directMatch?.slug) {
    return directMatch.slug;
  }

  const nameMatch = db
    .prepare("SELECT slug FROM categories WHERE LOWER(name) = LOWER(?)")
    .get(trimmed) as { slug: string } | undefined;

  if (nameMatch?.slug) {
    return nameMatch.slug;
  }

  const fallbackSlug = slugify(trimmed);
  const fallbackMatch = db
    .prepare("SELECT slug FROM categories WHERE slug = ?")
    .get(fallbackSlug) as { slug: string } | undefined;

  if (fallbackMatch?.slug) {
    return fallbackMatch.slug;
  }

  throw new Error("Category not found");
}

export function getAllPosts() {
  const rows = db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, COALESCE(c.slug, p.category) AS categorySlug,
      COALESCE(c.name, p.category) AS categoryName, p.status, p.tags,
                  p.featured_image AS featuredImage, p.author_id AS authorId, p.author_name AS authorName,
                  p.published_at AS publishedAt, p.scheduled_at AS scheduledAt,
                  p.created_at AS createdAt, p.updated_at AS updatedAt, p.view_count AS viewCount,
                  p.deleted_at AS deletedAt
           FROM posts p
           LEFT JOIN categories c ON c.slug = p.category OR c.name = p.category
           WHERE p.deleted_at IS NULL
           ORDER BY p.created_at DESC`
    )
    .all() as PostRow[];
  return rows;
}

export function getDeletedPosts() {
  const rows = db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, COALESCE(c.slug, p.category) AS categorySlug,
      COALESCE(c.name, p.category) AS categoryName, p.status, p.tags,
                  p.featured_image AS featuredImage, p.author_id AS authorId, p.author_name AS authorName,
                  p.published_at AS publishedAt, p.scheduled_at AS scheduledAt,
                  p.created_at AS createdAt, p.updated_at AS updatedAt, p.view_count AS viewCount,
                  p.deleted_at AS deletedAt
           FROM posts p
           LEFT JOIN categories c ON c.slug = p.category OR c.name = p.category
           WHERE p.deleted_at IS NOT NULL
           ORDER BY p.deleted_at DESC`
    )
    .all() as PostRow[];
  return rows;
}

export function getPostById(id: number) {
  const row = db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, COALESCE(c.slug, p.category) AS categorySlug,
      COALESCE(c.name, p.category) AS categoryName, p.status, p.tags,
                  p.featured_image AS featuredImage, p.author_id AS authorId, p.author_name AS authorName,
                  p.published_at AS publishedAt, p.scheduled_at AS scheduledAt,
                  p.created_at AS createdAt, p.updated_at AS updatedAt, p.view_count AS viewCount,
                  p.deleted_at AS deletedAt
           FROM posts p
           LEFT JOIN categories c ON c.slug = p.category OR c.name = p.category
           WHERE p.id = ? AND p.deleted_at IS NULL`
    )
    .get(id) as PostRow | undefined;
  return row;
}

export function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  status: string;
  tags: string[];
  featuredImage: string | null;
  authorId: number;
  authorName: string;
  publishedAt: string | null;
  scheduledAt: string | null;
}) {
  const statement = db.prepare(`
    INSERT INTO posts (
      title, slug, excerpt, content, category, status, tags, featured_image,
      author_id, author_name, published_at, scheduled_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    data.title,
    data.slug,
    data.excerpt,
    data.content,
    data.categorySlug,
    data.status,
    JSON.stringify(data.tags),
    data.featuredImage,
    data.authorId,
    data.authorName,
    data.publishedAt,
    data.scheduledAt
  );

  return result;
}

export function updatePost(id: number, updates: string[], values: unknown[]) {
  const statement = db.prepare(
    `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`
  );
  return statement.run(...values, id);
}

export function deletePost(id: number) {
  return db
    .prepare("UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(id);
}

export function restorePost(id: number) {
  return db.prepare("UPDATE posts SET deleted_at = NULL WHERE id = ?").run(id);
}

export function permanentDeletePost(id: number) {
  return db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

export function getPublicPosts(
  limit: number,
  offset: number = 0,
  category?: string
) {
  const cacheKey = `list:${limit}:${offset}:${category || "all"}`;
  const now = Date.now();
  const cached = publicPostsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  let query = `
    SELECT p.id, p.title, p.slug, p.excerpt, COALESCE(c.slug, p.category) AS categorySlug,
           COALESCE(c.name, p.category) AS categoryName, p.status, p.tags,
           p.featured_image AS featuredImage, p.author_name AS authorName,
           p.published_at AS publishedAt, p.created_at AS createdAt
    FROM posts p
    LEFT JOIN categories c ON c.slug = p.category OR c.name = p.category
    WHERE p.status = 'published' AND p.deleted_at IS NULL
  `;

  const params: (string | number)[] = [];

  if (category) {
    query += ` AND (c.slug = ? OR c.name = ?)`;
    params.push(category, category);
  }

  query += ` ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as PublicPostRow[];

  publicPostsCache.set(cacheKey, {
    expiresAt: now + CACHE_TTL * 1000,
    value: rows,
  });
  return rows;
}

export function getPublicPostBySlug(slug: string) {
  const now = Date.now();
  const cached = publicPostSlugCache.get(slug);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const row = db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, COALESCE(c.slug, p.category) AS categorySlug,
              COALESCE(c.name, p.category) AS categoryName, p.status, p.tags,
              p.featured_image AS featuredImage, p.author_name AS authorName,
              p.published_at AS publishedAt, p.created_at AS createdAt, p.view_count
       FROM posts p
       LEFT JOIN categories c ON c.slug = p.category OR c.name = p.category
       WHERE p.slug = ? AND p.status = 'published' AND p.deleted_at IS NULL`
    )
    .get(slug) as (PublicPostRow & { view_count: number }) | undefined;

  publicPostSlugCache.set(slug, {
    expiresAt: now + CACHE_TTL * 1000,
    value: row,
  });
  return row;
}

/**
 * Increment view count for a post (non-blocking)
 */
export function incrementViewCount(postId: number) {
  db.prepare("UPDATE posts SET view_count = view_count + 1 WHERE id = ?").run(
    postId
  );
}

/**
 * Clear cache for public posts (call after creating/updating/deleting posts)
 */
export function clearPublicPostsCache() {
  publicPostsCache.clear();
  publicPostSlugCache.clear();
}

export { slugify };
