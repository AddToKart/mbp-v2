import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: "admin";
  name: string;
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
  }
}

export default fp(async function authenticate(fastify: FastifyInstance) {
  fastify.decorate(
    "authenticate",
    async function authenticateRequest(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        // Try to get token from cookie first, then fall back to Authorization header
        // This allows both cookie-based and header-based auth during transition
        const cookieToken = request.cookies?.access_token;
        const authHeader = request.headers.authorization;

        if (!cookieToken && !authHeader) {
          return reply.unauthorized("Authentication required");
        }

        // If using Authorization header, extract the token
        if (!cookieToken && authHeader) {
          const [scheme, token] = authHeader.split(" ");
          if (scheme?.toLowerCase() !== "bearer" || !token) {
            return reply.unauthorized("Invalid authorization header format");
          }
        }

        await request.jwtVerify();

        if (!request.user || request.user.role !== "admin") {
          return reply.forbidden("Admin access required");
        }
      } catch (error) {
        return reply.unauthorized("Invalid or expired token");
      }
    }
  );
});
