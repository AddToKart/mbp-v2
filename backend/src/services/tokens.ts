import crypto from "node:crypto";
import { db } from "../db/client.js";

export interface RefreshTokenRecord {
  id: number;
  tokenHash: string;
  userId: number;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
}

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

/**
 * Hash a token for secure storage (we never store plain tokens)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create and store a new refresh token for a user
 */
export function createRefreshToken(
  userId: number,
  userAgent?: string,
  ipAddress?: string
): string {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  db.prepare(
    `INSERT INTO refresh_tokens (token_hash, user_id, user_agent, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    tokenHash,
    userId,
    userAgent ?? null,
    ipAddress ?? null,
    expiresAt.toISOString()
  );

  return token;
}

/**
 * Validate a refresh token and return the associated record if valid
 */
export function validateRefreshToken(token: string): RefreshTokenRecord | null {
  const tokenHash = hashToken(token);

  const record = db
    .prepare(
      `SELECT id, token_hash AS tokenHash, user_id AS userId, user_agent AS userAgent,
              ip_address AS ipAddress, expires_at AS expiresAt, created_at AS createdAt,
              revoked_at AS revokedAt
       FROM refresh_tokens
       WHERE token_hash = ?`
    )
    .get(tokenHash) as RefreshTokenRecord | undefined;

  if (!record) {
    return null;
  }

  // Check if revoked
  if (record.revokedAt) {
    return null;
  }

  // Check if expired
  const expiresAt = new Date(record.expiresAt);
  if (expiresAt < new Date()) {
    return null;
  }

  return record;
}

/**
 * Revoke a specific refresh token
 */
export function revokeRefreshToken(token: string): boolean {
  const tokenHash = hashToken(token);

  const result = db
    .prepare(
      `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`
    )
    .run(tokenHash);

  return result.changes > 0;
}

/**
 * Revoke all refresh tokens for a user (useful for logout all devices)
 */
export function revokeAllUserTokens(userId: number): number {
  const result = db
    .prepare(
      `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND revoked_at IS NULL`
    )
    .run(userId);

  return result.changes;
}

/**
 * Rotate a refresh token (revoke old, create new) - prevents token reuse attacks
 */
export function rotateRefreshToken(
  oldToken: string,
  userAgent?: string,
  ipAddress?: string
): { newToken: string; userId: number } | null {
  const record = validateRefreshToken(oldToken);

  if (!record) {
    return null;
  }

  // Revoke the old token
  revokeRefreshToken(oldToken);

  // Create a new token
  const newToken = createRefreshToken(record.userId, userAgent, ipAddress);

  return { newToken, userId: record.userId };
}

/**
 * Clean up expired and revoked tokens (run periodically)
 */
export function cleanupExpiredTokens(): number {
  const result = db
    .prepare(
      `DELETE FROM refresh_tokens
       WHERE revoked_at IS NOT NULL
          OR expires_at < datetime('now')`
    )
    .run();

  return result.changes;
}

/**
 * Get active sessions for a user
 */
export function getUserActiveSessions(userId: number): RefreshTokenRecord[] {
  const records = db
    .prepare(
      `SELECT id, token_hash AS tokenHash, user_id AS userId, user_agent AS userAgent,
              ip_address AS ipAddress, expires_at AS expiresAt, created_at AS createdAt,
              revoked_at AS revokedAt
       FROM refresh_tokens
       WHERE user_id = ? AND revoked_at IS NULL AND expires_at > datetime('now')
       ORDER BY created_at DESC`
    )
    .all(userId) as RefreshTokenRecord[];

  return records;
}
