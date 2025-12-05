import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  FASTIFY_PORT: z.coerce.number().default(4001),
  FASTIFY_HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().default("file:./backend/data/app.db"),
  // In production, enforce strong secrets. In dev, allow shorter ones for ease of use.
  JWT_SECRET: z.string().min(16).default("dev-jwt-secret-change-in-production"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(16)
    .default("dev-refresh-secret-change-in-prod"),
  DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  DEFAULT_ADMIN_NAME: z.string().default("Admin User"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
  COOKIE_DOMAIN: z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export const env = envSchema.parse(process.env);

const databasePath = env.DATABASE_URL.startsWith("file:")
  ? env.DATABASE_URL.slice(5)
  : env.DATABASE_URL;

export const resolvedDatabasePath = path.isAbsolute(databasePath)
  ? databasePath
  : path.resolve(process.cwd(), databasePath);
