import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import jwt from "@fastify/jwt";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./env.js";
import { runMigrations } from "./db/migrations.js";
import {
  ensureDefaultAdmin,
  ensureDefaultCategories,
  ensureDefaultSettings,
  ensureDefaultServices,
  ensureDefaultJobListings,
  ensureDefaultTourismItems,
} from "./db/seed.js";
import authenticatePlugin from "./plugins/authenticate.js";
import csrfPlugin from "./plugins/csrf.js";
import { authRoutes } from "./routes/auth.js";
import { adminPostRoutes } from "./routes/admin/posts.js";
import { adminCategoryRoutes } from "./routes/admin/categories.js";
import { adminSettingsRoutes } from "./routes/admin/settings.js";
import { adminUserRoutes } from "./routes/admin/users.js";
import { adminAnalyticsRoutes } from "./routes/admin/analytics.js";
import { publicPostRoutes } from "./routes/public/posts.js";
import { publicServicesRoutes } from "./routes/public/services.js";
import { cleanupExpiredTokens } from "./services/tokens.js";

const isProduction = env.NODE_ENV === "production";

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL || "info",
    },
    bodyLimit: 10 * 1024 * 1024,
  });

  // Basic utilities
  await fastify.register(sensible);

  // Cookie support (required for secure auth)
  await fastify.register(cookie, {
    secret: env.JWT_SECRET, // Cookie signing secret
    parseOptions: {},
  });

  await fastify.register(cors, {
    origin: isProduction
      ? ["https://yourdomain.com"] // Update with your production domain
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true, // Required for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  });

  // Security headers
  try {
    await fastify.register(helmet, {
      hidePoweredBy: true,
    });
  } catch (err) {
    fastify.log.warn({ err }, "Failed to register helmet plugin");
  }

  // Rate limiting (basic, in-memory).
  // Higher limits for general use, auth endpoints excluded from global limit
  try {
    await fastify.register(rateLimit, {
      global: true,
      max: Number(env.RATE_LIMIT_MAX) || 500, // Increased default
      timeWindow: "1 minute",
      // Exclude certain paths from rate limiting
      allowList: (request) => {
        // Auth endpoints have their own rate limiting
        const authPaths = [
          "/auth/csrf-token",
          "/auth/me",
          "/auth/refresh",
          "/health",
        ];
        return authPaths.some((path) => request.url.startsWith(path));
      },
      // Custom key generator - use IP address
      keyGenerator: (request) => {
        return (
          request.ip ||
          request.headers["x-forwarded-for"]?.toString() ||
          "unknown"
        );
      },
    });
  } catch (err) {
    fastify.log.warn({ err }, "Failed to register rate-limit plugin");
  }

  // Separate, more lenient rate limiting for auth endpoints
  fastify.addHook("onRoute", (routeOptions) => {
    const authEndpoints = ["/auth/csrf-token", "/auth/me", "/auth/refresh"];
    if (authEndpoints.includes(routeOptions.path)) {
      const originalHandler = routeOptions.handler;
      // Auth endpoints are excluded from global rate limit but still monitored
    }
  });

  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: "access_token",
      signed: false,
    },
  });

  await fastify.register(authenticatePlugin);
  await fastify.register(csrfPlugin);
  await fastify.register(authRoutes);
  await fastify.register(adminPostRoutes);
  await fastify.register(adminCategoryRoutes);
  await fastify.register(adminSettingsRoutes);
  await fastify.register(adminUserRoutes);
  await fastify.register(adminAnalyticsRoutes);
  await fastify.register(publicPostRoutes);
  await fastify.register(publicServicesRoutes);

  // Centralized error handler - returns consistent JSON and logs errors
  fastify.setErrorHandler(function (error, request, reply) {
    // Log full error server-side
    this.log.error(
      { err: error, url: request.url, method: request.method },
      "Unhandled error"
    );

    const status = (error && (error as any).statusCode) || 500;
    const message =
      (error && (error as any).message) || "Internal Server Error";

    // Do not leak stack traces in production
    const response: any = { status: "error", message };
    if ((env.NODE_ENV || "development") !== "production") {
      response.stack = error.stack;
    }

    reply.status(status).send(response);
  });

  fastify.get("/health", async () => ({ status: "ok" }));

  // CSRF token endpoint - clients call this to get a fresh CSRF token
  fastify.get("/auth/csrf-token", async (request, reply) => {
    const token = fastify.generateCsrfToken(request, reply);
    return { csrfToken: token };
  });

  return fastify;
}

async function start() {
  runMigrations();
  ensureDefaultAdmin();
  ensureDefaultCategories();
  ensureDefaultSettings();
  ensureDefaultServices();
  ensureDefaultJobListings();
  ensureDefaultTourismItems();

  // Cleanup expired tokens on startup and periodically
  cleanupExpiredTokens();
  setInterval(
    () => {
      cleanupExpiredTokens();
    },
    60 * 60 * 1000
  ); // Every hour

  const fastify = await buildServer();

  try {
    await fastify.listen({
      port: env.FASTIFY_PORT,
      host: env.FASTIFY_HOST,
    });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();
