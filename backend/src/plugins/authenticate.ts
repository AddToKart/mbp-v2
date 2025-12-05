import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: "admin" | "validator" | "citizen";
  name: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected" | "needs_info";
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    requireValidator: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export default fp(async function authenticate(fastify: FastifyInstance) {
  // Decorator to verify JWT token exists and is valid
  fastify.decorate(
    "authenticate",
    async function authenticateRequest(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        // Try to get token from cookie first, then fall back to Authorization header
        const cookieToken = request.cookies?.access_token;
        const authHeader = request.headers.authorization;

        if (!cookieToken && !authHeader) {
          return reply.unauthorized("Authentication required");
        }

        // Check header format if used
        if (!cookieToken && authHeader) {
          const [scheme, token] = authHeader.split(" ");
          if (scheme?.toLowerCase() !== "bearer" || !token) {
            return reply.unauthorized("Invalid authorization header format");
          }
        }

        await request.jwtVerify();
      } catch (error) {
        return reply.unauthorized("Invalid or expired token");
      }
    }
  );

  // Decorator to ensure user is an admin
  fastify.decorate(
    "requireAdmin",
    async function requireAdminRequest(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      if (!request.user || request.user.role !== "admin") {
        return reply.forbidden("Admin access required");
      }
    }
  );

  // Decorator to ensure user is a validator or admin
  fastify.decorate(
    "requireValidator",
    async function requireValidatorRequest(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      if (!request.user || (request.user.role !== "admin" && request.user.role !== "validator")) {
        return reply.forbidden("Validator access required");
      }
    }
  );
});
