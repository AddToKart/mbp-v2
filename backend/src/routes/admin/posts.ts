import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import * as postService from "../../services/posts.js";
import {
  CreatePostSchema,
  UpdatePostSchema,
  type CreatePostRequest,
  type UpdatePostRequest,
} from "../../../../types/shared.js";
import {
  sanitizeMarkdown,
  sanitizeUrl,
  removeControlChars,
} from "../../utils/sanitize.js";

type AdminUser = { id: number; email: string; name: string; role: "admin" };

type AdminRequest<T extends RouteGenericInterface> = FastifyRequest<T> & {
  user: AdminUser;
};

function toIsoOrNull(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

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

export async function adminPostRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/admin/posts",
    { preHandler: fastify.authenticate },
    async function getPosts(_request: FastifyRequest, reply: FastifyReply) {
      const rows = postService.getAllPosts();

      return reply.send(
        rows.map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          content: row.content,
          categorySlug: row.categorySlug,
          categoryName: row.categoryName ?? row.categorySlug,
          status: row.status,
          tags: parseTags(row.tags),
          featuredImage: row.featuredImage,
          authorId: row.authorId,
          authorName: row.authorName,
          publishedAt: row.publishedAt,
          scheduledAt: row.scheduledAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          viewCount: row.viewCount,
        }))
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/admin/posts/:id",
    { preHandler: fastify.authenticate },
    async function getPostById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid post id");
      }

      const row = postService.getPostById(id);

      if (!row) {
        return reply.notFound("Post not found");
      }

      return reply.send({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        categorySlug: row.categorySlug,
        categoryName: row.categoryName ?? row.categorySlug,
        status: row.status,
        tags: parseTags(row.tags),
        featuredImage: row.featuredImage,
        authorId: row.authorId,
        authorName: row.authorName,
        publishedAt: row.publishedAt,
        scheduledAt: row.scheduledAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        viewCount: row.viewCount,
      });
    }
  );

  fastify.post<{ Body: CreatePostRequest }>(
    "/admin/posts",
    { preHandler: fastify.authenticate },
    async function createPost(
      req: FastifyRequest<{ Body: CreatePostRequest }>,
      reply: FastifyReply
    ) {
      const request = req as AdminRequest<{ Body: CreatePostRequest }>;
      const parsed = CreatePostSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const {
        title,
        slug: providedSlug,
        excerpt,
        content,
        category,
        status,
        tags,
        featuredImage,
        scheduledAt,
      } = parsed.data;

      // Sanitize user-provided content
      const sanitizedTitle = removeControlChars(title);
      const sanitizedExcerpt = removeControlChars(excerpt);
      const sanitizedContent = sanitizeMarkdown(content);
      const sanitizedTags = tags.map((tag) =>
        removeControlChars(tag).slice(0, 50)
      );
      const sanitizedImage = featuredImage ? sanitizeUrl(featuredImage) : null;

      const baseSlug = providedSlug
        ? postService.slugify(providedSlug)
        : postService.slugify(sanitizedTitle);
      const slug = postService.ensureUniqueSlug(baseSlug);
      const scheduledIso = toIsoOrNull(scheduledAt);
      const publishedAt =
        status === "published" ? new Date().toISOString() : null;

      let categorySlug: string;
      try {
        categorySlug = postService.resolveCategorySlug(category);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invalid category";
        return reply.badRequest(message);
      }

      const result = postService.createPost({
        title: sanitizedTitle,
        slug,
        excerpt: sanitizedExcerpt,
        content: sanitizedContent,
        categorySlug,
        status,
        tags: sanitizedTags,
        featuredImage: sanitizedImage,
        authorId: request.user.id,
        authorName: request.user.name,
        publishedAt,
        scheduledAt: scheduledIso,
      });

      return reply.code(201).send({
        id: result.lastInsertRowid,
        slug,
      });
    }
  );

  fastify.put<{
    Params: { id: string };
    Body: UpdatePostRequest;
  }>(
    "/admin/posts/:id",
    { preHandler: fastify.authenticate },
    async function updatePost(
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdatePostRequest;
      }>,
      reply: FastifyReply
    ) {
      const request = req as AdminRequest<{
        Params: { id: string };
        Body: UpdatePostRequest;
      }>;
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid post id");
      }

      const parsed = UpdatePostSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const existing = db.prepare("SELECT id FROM posts WHERE id = ?").get(id);
      if (!existing) {
        return reply.notFound("Post not found");
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      if (parsed.data.title !== undefined) {
        updates.push("title = ?");
        values.push(removeControlChars(parsed.data.title));
      }

      if (parsed.data.excerpt !== undefined) {
        updates.push("excerpt = ?");
        values.push(removeControlChars(parsed.data.excerpt));
      }

      if (parsed.data.content !== undefined) {
        updates.push("content = ?");
        values.push(sanitizeMarkdown(parsed.data.content));
      }

      if (parsed.data.category !== undefined) {
        try {
          const categorySlug = postService.resolveCategorySlug(
            parsed.data.category
          );
          updates.push("category = ?");
          values.push(categorySlug);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Invalid category";
          return reply.badRequest(message);
        }
      }

      if (parsed.data.status !== undefined) {
        updates.push("status = ?");
        values.push(parsed.data.status);
        if (parsed.data.status === "published") {
          updates.push(
            "published_at = COALESCE(published_at, CURRENT_TIMESTAMP)"
          );
        }
      }

      if (parsed.data.tags !== undefined) {
        updates.push("tags = ?");
        const sanitizedTags = parsed.data.tags.map((tag) =>
          removeControlChars(tag).slice(0, 50)
        );
        values.push(JSON.stringify(sanitizedTags));
      }

      if (parsed.data.featuredImage !== undefined) {
        updates.push("featured_image = ?");
        values.push(
          parsed.data.featuredImage
            ? sanitizeUrl(parsed.data.featuredImage)
            : null
        );
      }

      if (parsed.data.slug !== undefined) {
        const sanitizedSlug = postService.ensureUniqueSlug(
          postService.slugify(parsed.data.slug),
          id
        );
        updates.push("slug = ?");
        values.push(sanitizedSlug);
      }

      if (parsed.data.scheduledAt !== undefined) {
        updates.push("scheduled_at = ?");
        values.push(toIsoOrNull(parsed.data.scheduledAt));
      }

      if (updates.length === 0) {
        return reply.send({ updated: false });
      }

      postService.updatePost(id, updates, values);

      return reply.send({ updated: true });
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/admin/posts/:id",
    { preHandler: fastify.authenticate },
    async function deletePost(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid post id");
      }

      const result = postService.deletePost(id);

      if (result.changes === 0) {
        return reply.notFound("Post not found");
      }

      return reply.code(204).send();
    }
  );
}
