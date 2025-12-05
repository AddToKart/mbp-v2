import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  CreateUserSchema,
  type CreateUserRequest,
} from "../../../../types/shared.js";
import * as userService from "../../services/users.js";

export async function adminUserRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/admin/users",
    { preHandler: fastify.authenticate },
    async function listUsers(_request: FastifyRequest, reply: FastifyReply) {
      const rows = userService.getAllUsers();
      return reply.send(rows);
    }
  );

  fastify.post<{ Body: CreateUserRequest }>(
    "/admin/users",
    { preHandler: fastify.authenticate },
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

  fastify.delete<{ Params: { id: string } }>(
    "/admin/users/:id",
    { preHandler: fastify.authenticate },
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
