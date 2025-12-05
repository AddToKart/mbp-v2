import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PublicPost } from "../../../../types/shared.js";
import * as postService from "../../services/posts.js";
import * as viewService from "../../services/views.js";

// Cache durations in seconds
const CACHE_SHORT = 60; // 1 minute for list endpoints
const CACHE_LONG = 300; // 5 minutes for individual posts

function parseTags(raw: string | null | undefined) {
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Set cache headers for public responses
 */
function setCacheHeaders(reply: FastifyReply, maxAge: number) {
  reply.header(
    "Cache-Control",
    `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  reply.header("Vary", "Accept-Encoding");
}

export async function publicPostRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/posts",
    async function listPosts(
      request: FastifyRequest<{
        Querystring: { limit?: string; page?: string; category?: string };
      }>,
      reply: FastifyReply
    ) {
      const limit = request.query.limit
        ? Number.parseInt(request.query.limit, 10)
        : 20;
      const safeLimit = Number.isNaN(limit) ? 20 : Math.min(limit, 100);

      const page = request.query.page
        ? Number.parseInt(request.query.page, 10)
        : 1;
      const safePage = Number.isNaN(page) || page < 1 ? 1 : page;

      const offset = (safePage - 1) * safeLimit;
      const category = request.query.category || undefined;

      const rows = postService.getPublicPosts(safeLimit, offset, category);

      const posts: PublicPost[] = rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        categorySlug: row.categorySlug,
        category: row.categoryName ?? row.categorySlug,
        status: row.status,
        tags: parseTags(row.tags as string | null | undefined),
        featuredImage: row.featuredImage,
        authorName: row.authorName,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
      }));

      // Set cache headers for list endpoint
      setCacheHeaders(reply, CACHE_SHORT);

      return reply.send(posts);
    }
  );

  fastify.get<{ Params: { slug: string } }>(
    "/posts/:slug",
    async function getPost(
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) {
      const row = postService.getPublicPostBySlug(request.params.slug);

      if (!row) {
        return reply.notFound("Post not found");
      }

      // View tracking is now handled separately via POST /posts/:slug/view
      // This prevents automatic view increments from bots, crawlers, etc.

      const post: PublicPost = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        categorySlug: row.categorySlug,
        category: row.categoryName ?? row.categorySlug,
        status: row.status,
        tags: parseTags(row.tags as string | null | undefined),
        featuredImage: row.featuredImage,
        authorName: row.authorName,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        viewCount: row.view_count ?? 0,
      };

      // Set cache headers for individual post
      setCacheHeaders(reply, CACHE_LONG);

      return reply.send(post);
    }
  );

  // Record a view for a post (called from frontend)
  fastify.post<{ Params: { slug: string }; Body: { userId?: number } }>(
    "/posts/:slug/view",
    async function recordView(
      request: FastifyRequest<{
        Params: { slug: string };
        Body: { userId?: number };
      }>,
      reply: FastifyReply
    ) {
      const row = postService.getPublicPostBySlug(request.params.slug);

      if (!row) {
        return reply.notFound("Post not found");
      }

      // Get IP address (handle proxies)
      const forwardedFor = request.headers["x-forwarded-for"];
      const ipAddress = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(",")[0]?.trim() || request.ip || "unknown";

      // Get user agent for analytics
      const userAgent = request.headers["user-agent"] || undefined;

      // Get user ID from request body (if citizen is logged in)
      const userId = request.body?.userId || null;

      // Record the view
      const isNewView = viewService.recordPostView({
        postId: row.id,
        userId,
        ipAddress,
        userAgent,
      });

      return reply.send({
        success: true,
        isNewView,
        viewCount: viewService.getPostViewCount(row.id),
      });
    }
  );
}
