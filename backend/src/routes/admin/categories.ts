import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from "../../../../types/shared.js";
import * as categoryService from "../../services/categories.js";

export async function adminCategoryRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/admin/categories",
    { preHandler: fastify.authenticate },
    async function listCategories(_request, reply: FastifyReply) {
      const rows = categoryService.getAllCategories();
      return reply.send(rows);
    }
  );

  fastify.post<{ Body: CreateCategoryRequest }>(
    "/admin/categories",
    { preHandler: fastify.authenticate },
    async function createCategory(
      request: FastifyRequest<{ Body: CreateCategoryRequest }>,
      reply: FastifyReply
    ) {
      const parsed = CreateCategorySchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const { name, description, color } = parsed.data;
      const baseSlug = categoryService.slugify(name);
      const slug = categoryService.ensureUniqueCategorySlug(baseSlug);

      const result = categoryService.createCategory({
        name,
        slug,
        description: description ?? "",
        color: color ?? "#6366f1",
      });

      const created = categoryService.getCategoryById(
        Number(result.lastInsertRowid)
      );
      return reply.code(201).send({ ...created, postCount: 0 });
    }
  );

  fastify.put<{
    Params: { id: string };
    Body: UpdateCategoryRequest;
  }>(
    "/admin/categories/:id",
    { preHandler: fastify.authenticate },
    async function updateCategory(
      request: FastifyRequest<{
        Params: { id: string };
        Body: UpdateCategoryRequest;
      }>,
      reply: FastifyReply
    ) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid category id");
      }

      const existing = categoryService.getCategoryById(id);
      if (!existing) {
        return reply.notFound("Category not found");
      }

      const parsed = UpdateCategorySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const updates: string[] = [];
      const values: unknown[] = [];
      let updatedSlug = existing.slug;

      if (parsed.data.name && parsed.data.name !== existing.name) {
        const newSlug = categoryService.ensureUniqueCategorySlug(
          categoryService.slugify(parsed.data.name),
          existing.id
        );
        updates.push("name = ?", "slug = ?");
        values.push(parsed.data.name, newSlug);
        updatedSlug = newSlug;
      }

      if (parsed.data.description !== undefined) {
        updates.push("description = ?");
        values.push(parsed.data.description ?? "");
      }

      if (parsed.data.color !== undefined) {
        updates.push("color = ?");
        values.push(parsed.data.color ?? "#6366f1");
      }

      if (updates.length === 0) {
        return reply.send({ updated: false });
      }

      categoryService.updateCategory(id, updates, values);

      if (updatedSlug !== existing.slug) {
        categoryService.updatePostCategories(
          existing.slug,
          existing.name,
          updatedSlug
        );
      }

      const refreshed = categoryService.getCategoryById(id);

      if (!refreshed) {
        return reply.send({ updated: true });
      }

      const postCount = categoryService.getCategoryPostCount(
        updatedSlug,
        refreshed.name
      );

      return reply.send({
        ...refreshed,
        postCount,
        updated: true,
      });
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/admin/categories/:id",
    { preHandler: fastify.authenticate },
    async function deleteCategory(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid category id");
      }

      const existing = categoryService.getCategoryById(id);
      if (!existing) {
        return reply.notFound("Category not found");
      }

      const postCount = categoryService.getCategoryPostCount(
        existing.slug,
        existing.name
      );

      if (postCount > 0) {
        return reply.status(409).send({
          message: "Cannot delete category with existing posts",
          postCount,
        });
      }

      categoryService.deleteCategory(id);
      return reply.code(204).send();
    }
  );
}
