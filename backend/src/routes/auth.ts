import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LoginSchema } from "../../../types/shared.js";
import * as userService from "../services/users.js";
import * as tokenService from "../services/tokens.js";
import { env } from "../env.js";
import type { AuthenticatedUser } from "../plugins/authenticate.js";

const isProduction = env.NODE_ENV === "production";
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour access token
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Cookie configuration for security
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: isProduction, // HTTPS only in production
  sameSite: "lax" as const, // CSRF protection
  path: "/",
  domain: env.COOKIE_DOMAIN || undefined,
};

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/login
   * Authenticates user and sets httpOnly cookies for access and refresh tokens
   */
  fastify.post<{ Body: { email: string; password: string } }>(
    "/auth/login",
    async function loginHandler(
      request: FastifyRequest<{ Body: { email: string; password: string } }>,
      reply: FastifyReply
    ) {
      const parsed = LoginSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const { email, password } = parsed.data;

      const user = userService.getUserWithPasswordByEmail(email.toLowerCase());

      if (!user) {
        return reply.unauthorized("Invalid credentials");
      }

      const passwordMatch = userService.verifyPassword(
        password,
        user.passwordHash
      );

      if (!passwordMatch) {
        return reply.unauthorized("Invalid credentials");
      }

      // Generate short-lived access token
      const accessToken = fastify.jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      // Generate refresh token
      const userAgent = request.headers["user-agent"];
      const ipAddress = request.ip;
      const refreshToken = tokenService.createRefreshToken(
        user.id,
        userAgent,
        ipAddress
      );

      // Set access token cookie
      reply.setCookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: COOKIE_MAX_AGE,
      });

      // Set refresh token cookie (separate, longer-lived)
      reply.setCookie("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_COOKIE_MAX_AGE,
        path: "/", // Sent with all requests to enable refresh
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
          rejectionReason: user.rejectionReason,
          rejectionDate: user.rejectionDate,
        },
        // Include token for backward compatibility with existing frontend
        // Remove this once frontend is fully migrated to cookie-based auth
        token: accessToken,
      };
    }
  );

  /**
   * POST /auth/refresh
   * Uses refresh token to get a new access token (token rotation)
   */
  fastify.post(
    "/auth/refresh",
    async function refreshHandler(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const refreshToken = request.cookies?.refresh_token;

      if (!refreshToken) {
        return reply.unauthorized("Refresh token required");
      }

      // Rotate the refresh token (revoke old, create new)
      const userAgent = request.headers["user-agent"];
      const ipAddress = request.ip;
      const rotation = tokenService.rotateRefreshToken(
        refreshToken,
        userAgent,
        ipAddress
      );

      if (!rotation) {
        // Clear invalid cookies
        reply.clearCookie("access_token", { path: "/" });
        reply.clearCookie("refresh_token", { path: "/" });
        return reply.unauthorized("Invalid or expired refresh token");
      }

      // Get user data for new access token
      const user = userService.getUserById(rotation.userId);

      if (!user) {
        reply.clearCookie("access_token", { path: "/" });
        reply.clearCookie("refresh_token", { path: "/" });
        return reply.unauthorized("User not found");
      }

      // Generate new access token
      const accessToken = fastify.jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      // Set new access token cookie
      reply.setCookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: COOKIE_MAX_AGE,
      });

      // Set new refresh token cookie
      reply.setCookie("refresh_token", rotation.newToken, {
        ...cookieOptions,
        maxAge: REFRESH_COOKIE_MAX_AGE,
        path: "/",
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
        // Include token for backward compatibility
        token: accessToken,
      };
    }
  );

  /**
   * POST /auth/logout
   * Revokes refresh token and clears auth cookies
   */
  fastify.post(
    "/auth/logout",
    async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
      const refreshToken = request.cookies?.refresh_token;

      // Revoke refresh token if present
      if (refreshToken) {
        tokenService.revokeRefreshToken(refreshToken);
      }

      // Clear all auth cookies
      reply.clearCookie("access_token", { path: "/" });
      reply.clearCookie("refresh_token", { path: "/" });

      return { message: "Logged out successfully" };
    }
  );

  /**
   * POST /auth/logout-all
   * Revokes all refresh tokens for the user (logout from all devices)
   */
  fastify.post(
    "/auth/logout-all",
    { preHandler: fastify.authenticate },
    async function logoutAllHandler(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const userId = request.user.id;

      // Revoke all tokens for this user
      const revokedCount = tokenService.revokeAllUserTokens(userId);

      // Clear current session cookies
      reply.clearCookie("access_token", { path: "/" });
      reply.clearCookie("refresh_token", { path: "/" });

      return {
        message: "Logged out from all devices",
        sessionsRevoked: revokedCount,
      };
    }
  );

  /**
   * GET /auth/me
   * Returns current user info if authenticated (always fetches fresh from DB)
   */
  fastify.get(
    "/auth/me",
    { preHandler: fastify.authenticate },
    async function meHandler(request: FastifyRequest, reply: FastifyReply) {
      // Fetch fresh user data from database to ensure role/status is current
      const user = userService.getUserById(request.user.id);

      if (!user) {
        // User was deleted or doesn't exist - clear cookies and return 401
        reply.clearCookie("access_token", { path: "/" });
        reply.clearCookie("refresh_token", { path: "/" });
        return reply.unauthorized("User not found");
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
      };
    }
  );

  /**
   * GET /auth/sessions
   * Returns active sessions for the current user
   */
  fastify.get(
    "/auth/sessions",
    { preHandler: fastify.authenticate },
    async function sessionsHandler(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const sessions = tokenService.getUserActiveSessions(request.user.id);

      return {
        sessions: sessions.map((s) => ({
          id: s.id,
          userAgent: s.userAgent,
          ipAddress: s.ipAddress,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
        })),
      };
    }
  );
}
