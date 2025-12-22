import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  CreateUserSchema,
  type CreateUserRequest,
} from "../../../../types/shared.js";
import * as userService from "../../services/users.js";

export async function adminUserRoutes(fastify: FastifyInstance) {
  // Get paginated users with filtering
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      role?: string;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    };
  }>(
    "/admin/users",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function listUsers(request, reply) {
      const {
        page = "1",
        limit = "25",
        role,
        status,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
      } = request.query;

      const result = userService.getUsersWithPagination({
        page: parseInt(page, 10) || 1,
        limit: Math.min(parseInt(limit, 10) || 25, 100), // Cap at 100
        role: role || undefined,
        verificationStatus: status || undefined,
        search: search || undefined,
        sortBy,
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
      });

      return reply.send(result);
    }
  );

  // Get user stats for dashboard
  fastify.get(
    "/admin/users/stats",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function getUserStats(_request: FastifyRequest, reply: FastifyReply) {
      const stats = userService.getUserStats();
      return reply.send(stats);
    }
  );

  fastify.post<{ Body: CreateUserRequest }>(
    "/admin/users",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function createUser(
      request: FastifyRequest<{ Body: CreateUserRequest }> & {
        user: { id: number };
      },
      reply: FastifyReply
    ) {
      const parsed = CreateUserSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const { email, name, password } = parsed.data;

      const existing = userService.getUserByEmail(email);

      if (existing) {
        return reply.status(409).send({ message: "Email already in use" });
      }

      const passwordHash = userService.hashPassword(password);

      const result = userService.createUser({
        email,
        name,
        passwordHash,
      });

      const created = userService.getUserById(Number(result.lastInsertRowid));

      return reply.code(201).send(created);
    }
  );

  // Update user
  fastify.put<{
    Params: { id: string };
    Body: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      verificationStatus?: string;
    };
  }>(
    "/admin/users/:id",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function updateUser(request, reply) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid user id");
      }

      const existing = userService.getUserById(id);
      if (!existing) {
        return reply.notFound("User not found");
      }

      const { name, email, password, role, verificationStatus } = request.body;

      // Check email uniqueness if changing email
      if (email && email !== existing.email) {
        const emailExists = userService.getUserByEmail(email);
        if (emailExists) {
          return reply.status(409).send({ message: "Email already in use" });
        }
      }

      // Build update data
      const updateData: {
        name?: string;
        email?: string;
        passwordHash?: string;
        role?: string;
        verificationStatus?: string;
      } = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.passwordHash = userService.hashPassword(password);
      if (role) updateData.role = role;
      if (verificationStatus) updateData.verificationStatus = verificationStatus;

      userService.updateUser(id, updateData);
      const updated = userService.getUserById(id);

      return reply.send(updated);
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/admin/users/:id",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function deleteUser(
      request: FastifyRequest<{ Params: { id: string } }> & {
        user: { id: number };
      },
      reply: FastifyReply
    ) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid user id");
      }

      if (id === request.user.id) {
        return reply
          .status(400)
          .send({ message: "You cannot delete your own account" });
      }

      const existing = userService.getUserById(id);

      if (!existing) {
        return reply.notFound("User not found");
      }

      userService.deleteUser(id);
      return reply.code(204).send();
    }
  );
}
