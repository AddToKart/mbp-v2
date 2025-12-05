import { db } from "../db/client.js";

export function getAnalyticsSummary() {
  const summaryRow = db
    .prepare(
      `SELECT
         COUNT(*) AS totalPosts,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS publishedPosts,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draftPosts,
         SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduledPosts,
         COALESCE(SUM(view_count), 0) AS totalViews
       FROM posts`
    )
    .get() as {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    totalViews: number;
  };

  return {
    totalPosts: summaryRow?.totalPosts ?? 0,
    publishedPosts: summaryRow?.publishedPosts ?? 0,
    draftPosts: summaryRow?.draftPosts ?? 0,
    scheduledPosts: summaryRow?.scheduledPosts ?? 0,
    totalViews: summaryRow?.totalViews ?? 0,
  };
}

export function getCategoryBreakdown() {
  return db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.color,
              COUNT(p.id) AS postCount
       FROM categories c
       LEFT JOIN posts p ON p.category = c.slug OR p.category = c.name
       GROUP BY c.id
       ORDER BY postCount DESC, c.name ASC`
    )
    .all() as Array<{
    id: number;
    name: string;
    slug: string;
    color: string;
    postCount: number;
  }>;
}

export function getMonthlyViews() {
  return db
    .prepare(
      `SELECT
         strftime('%Y-%m', COALESCE(p.published_at, p.created_at)) AS month,
         COUNT(*) AS posts,
         COALESCE(SUM(p.view_count), 0) AS views
       FROM posts p
       WHERE COALESCE(p.published_at, p.created_at) >= date('now', '-6 months')
       GROUP BY month
       ORDER BY month ASC`
    )
    .all() as Array<{ month: string; posts: number; views: number }>;
}

export function getRecentPosts() {
  return db
    .prepare(
      `SELECT p.id, p.title, p.status, p.view_count AS viewCount,
              p.category AS categorySlug,
              COALESCE(c.name, p.category) AS categoryName,
              p.published_at AS publishedAt,
              p.updated_at AS updatedAt,
              p.created_at AS createdAt
       FROM posts p
       LEFT JOIN categories c ON c.slug = p.category OR c.name = p.category
       ORDER BY p.updated_at DESC, p.created_at DESC
       LIMIT 8`
    )
    .all() as Array<{
    id: number;
    title: string;
    status: string;
    viewCount: number;
    categorySlug: string;
    categoryName: string;
    publishedAt: string | null;
    updatedAt: string;
    createdAt: string;
  }>;
}

export function getUpcomingSchedule() {
  const upcoming = db
    .prepare(
      `SELECT
         COUNT(*) AS scheduledCount,
         MIN(scheduled_at) AS nextScheduled
       FROM posts
       WHERE status = 'scheduled'
         AND scheduled_at IS NOT NULL
         AND datetime(scheduled_at) >= datetime('now')`
    )
    .get() as { scheduledCount: number; nextScheduled: string | null };

  return {
    scheduledCount: upcoming?.scheduledCount ?? 0,
    nextScheduled: upcoming?.nextScheduled ?? null,
  };
}

export function getRecentActivity() {
  return db
    .prepare(
      `SELECT p.title, p.status, p.updated_at AS updatedAt, p.author_name AS authorName
       FROM posts p
       ORDER BY p.updated_at DESC
       LIMIT 10`
    )
    .all() as Array<{
    title: string;
    status: string;
    updatedAt: string;
    authorName: string;
  }>;
}

export function getPostAnalytics(postId: number) {
  const post = db
    .prepare(
      "SELECT title, status, published_at, view_count FROM posts WHERE id = ?"
    )
    .get(postId) as
    | {
        title: string;
        status: string;
        published_at: string | null;
        view_count: number;
      }
    | undefined;

  if (!post) return null;

  // Get views over last 30 days
  const dailyViews = db
    .prepare(
      `SELECT
         date(viewed_at) as date,
         COUNT(*) as views
       FROM post_views
       WHERE post_id = ?
         AND viewed_at >= date('now', '-30 days')
       GROUP BY date(viewed_at)
       ORDER BY date(viewed_at) ASC`
    )
    .all(postId) as Array<{ date: string; views: number }>;

  return {
    title: post.title,
    status: post.status,
    publishedAt: post.published_at,
    totalViews: post.view_count,
    dailyViews,
  };
}
