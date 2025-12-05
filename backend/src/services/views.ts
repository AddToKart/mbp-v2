import { db } from "../db/client.js";

interface RecordViewParams {
  postId: number;
  userId?: number | null;
  ipAddress: string;
  userAgent?: string;
}

interface ViewRecord {
  id: number;
  post_id: number;
  user_id: number | null;
  ip_address: string;
  user_agent: string | null;
  viewed_at: string;
}

/**
 * Records a view for a post.
 * - For logged-in users: 1 view per user per post (lifetime)
 * - For guests: 1 view per IP per post per day
 *
 * Returns true if a new view was recorded, false if already viewed
 */
export function recordPostView({
  postId,
  userId,
  ipAddress,
  userAgent,
}: RecordViewParams): boolean {
  try {
    if (userId) {
      // Logged-in user: check if they've already viewed this post
      const existingView = db
        .prepare(`SELECT id FROM post_views WHERE post_id = ? AND user_id = ?`)
        .get(postId, userId) as ViewRecord | undefined;

      if (existingView) {
        return false; // Already viewed
      }

      // Record the view
      db.prepare(
        `INSERT INTO post_views (post_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)`
      ).run(postId, userId, ipAddress, userAgent || null);
    } else {
      // Guest user: check if this IP has viewed today
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const existingView = db
        .prepare(
          `SELECT id FROM post_views 
           WHERE post_id = ? AND ip_address = ? AND user_id IS NULL 
           AND DATE(viewed_at) = ?`
        )
        .get(postId, ipAddress, today) as ViewRecord | undefined;

      if (existingView) {
        return false; // Already viewed today
      }

      // Record the view
      db.prepare(
        `INSERT INTO post_views (post_id, ip_address, user_agent) VALUES (?, ?, ?)`
      ).run(postId, ipAddress, userAgent || null);
    }

    // Increment the view count on the post
    db.prepare(`UPDATE posts SET view_count = view_count + 1 WHERE id = ?`).run(
      postId
    );

    return true;
  } catch (error) {
    // Handle unique constraint violations gracefully
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return false;
    }
    console.error("Error recording post view:", error);
    return false;
  }
}

/**
 * Gets the view count for a post
 */
export function getPostViewCount(postId: number): number {
  const result = db
    .prepare(`SELECT view_count FROM posts WHERE id = ?`)
    .get(postId) as { view_count: number } | undefined;

  return result?.view_count ?? 0;
}

/**
 * Checks if a user has already viewed a post
 */
export function hasUserViewedPost(postId: number, userId: number): boolean {
  const result = db
    .prepare(`SELECT id FROM post_views WHERE post_id = ? AND user_id = ?`)
    .get(postId, userId);

  return !!result;
}

/**
 * Checks if an IP has viewed a post today
 */
export function hasIpViewedPostToday(
  postId: number,
  ipAddress: string
): boolean {
  const today = new Date().toISOString().split("T")[0];
  const result = db
    .prepare(
      `SELECT id FROM post_views 
       WHERE post_id = ? AND ip_address = ? AND user_id IS NULL 
       AND DATE(viewed_at) = ?`
    )
    .get(postId, ipAddress, today);

  return !!result;
}

/**
 * Gets view statistics for a post
 */
export function getPostViewStats(postId: number): {
  totalViews: number;
  uniqueUsers: number;
  uniqueIps: number;
  last24Hours: number;
  last7Days: number;
} {
  const totalViews = getPostViewCount(postId);

  const uniqueUsers = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT user_id) as count FROM post_views WHERE post_id = ? AND user_id IS NOT NULL`
      )
      .get(postId) as { count: number }
  ).count;

  const uniqueIps = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT ip_address) as count FROM post_views WHERE post_id = ?`
      )
      .get(postId) as { count: number }
  ).count;

  const last24Hours = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM post_views 
         WHERE post_id = ? AND viewed_at >= datetime('now', '-24 hours')`
      )
      .get(postId) as { count: number }
  ).count;

  const last7Days = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM post_views 
         WHERE post_id = ? AND viewed_at >= datetime('now', '-7 days')`
      )
      .get(postId) as { count: number }
  ).count;

  return {
    totalViews,
    uniqueUsers,
    uniqueIps,
    last24Hours,
    last7Days,
  };
}

/**
 * Recalculates and syncs view_count based on actual records in post_views table
 * Useful for data integrity checks
 */
export function syncPostViewCount(postId: number): void {
  const actualCount = (
    db
      .prepare(`SELECT COUNT(*) as count FROM post_views WHERE post_id = ?`)
      .get(postId) as { count: number }
  ).count;

  db.prepare(`UPDATE posts SET view_count = ? WHERE id = ?`).run(
    actualCount,
    postId
  );
}
