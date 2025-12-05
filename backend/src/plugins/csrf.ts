import fp from "fastify-plugin";
import crypto from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    csrfProtection: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    generateCsrfToken: (request: FastifyRequest, reply: FastifyReply) => string;
  }

  interface FastifyRequest {
    csrfToken?: string;
  }
}

const CSRF_TOKEN_EXPIRY = 4 * 60 * 60 * 1000; // 4 hours
const CSRF_SECRET_LENGTH = 32;

/**
 * CSRF Protection Plugin
 *
 * Uses the double-submit cookie pattern:
 * 1. Server generates a token and sends it in a cookie + response
 * 2. Client sends the token back in a header (X-CSRF-Token)
 * 3. Server verifies the header matches the cookie
 *
 * This works because:
 * - Attackers can't read cookies from another domain (Same-Origin Policy)
 * - Attackers can't set custom headers in cross-origin requests
 */
export default fp(async function csrfProtection(fastify: FastifyInstance) {
  // Generate a CSRF token
  fastify.decorate(
    "generateCsrfToken",
    function generateCsrfToken(
      request: FastifyRequest,
      reply: FastifyReply
    ): string {
      const token = crypto.randomBytes(CSRF_SECRET_LENGTH).toString("hex");
      const timestamp = Date.now().toString(36);
      const csrfToken = `${token}.${timestamp}`;

      // Set CSRF token in a non-httpOnly cookie (client needs to read it)
      reply.setCookie("csrf_token", csrfToken, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: CSRF_TOKEN_EXPIRY,
      });

      return csrfToken;
    }
  );

  // Verify CSRF token middleware
  fastify.decorate(
    "csrfProtection",
    async function verifyCsrfToken(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      // Skip CSRF for safe methods
      const safeMethods = ["GET", "HEAD", "OPTIONS"];
      if (safeMethods.includes(request.method)) {
        return;
      }

      const cookieToken = request.cookies?.csrf_token;
      const headerToken = request.headers["x-csrf-token"] as string | undefined;

      if (!cookieToken || !headerToken) {
        return reply.forbidden("CSRF token missing");
      }

      if (cookieToken !== headerToken) {
        return reply.forbidden("CSRF token mismatch");
      }

      // Validate token format and expiry
      const parts = cookieToken.split(".");
      if (parts.length !== 2) {
        return reply.forbidden("Invalid CSRF token format");
      }

      const timestamp = parseInt(parts[1], 36);
      if (isNaN(timestamp) || Date.now() - timestamp > CSRF_TOKEN_EXPIRY) {
        // Clear expired token
        reply.clearCookie("csrf_token", { path: "/" });
        return reply.forbidden("CSRF token expired");
      }
    }
  );
});
