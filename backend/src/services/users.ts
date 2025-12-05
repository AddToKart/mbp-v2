import { db } from "../db/client.js";
import bcrypt from "bcryptjs";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "validator" | "citizen";
  verificationStatus: "none" | "pending" | "approved" | "rejected" | "needs_info";
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserWithPassword extends AdminUser {
  passwordHash: string;
  rejectionReason?: string | null;
  rejectionDate?: string | null;
}

export function getAllUsers() {
  const rows = db
    .prepare(
      `SELECT id, email, name, role, verification_status AS verificationStatus, created_at AS createdAt, updated_at AS updatedAt
       FROM users ORDER BY created_at DESC`
    )
    .all() as AdminUser[];
  return rows;
}

export function getUserById(id: number) {
  const row = db
    .prepare(
      `SELECT id, email, name, role, verification_status AS verificationStatus, created_at AS createdAt, updated_at AS updatedAt
       FROM users WHERE id = ?`
    )
    .get(id) as AdminUser | undefined;
  return row;
}

export function getUserByEmail(email: string) {
  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as
    | { id: number }
    | undefined;
  return row;
}

export function getUserWithPasswordByEmail(email: string) {
  const row = db
    .prepare(
      `SELECT id, email, password_hash as passwordHash, name, role, 
       verification_status AS verificationStatus,
       rejection_reason AS rejectionReason,
       rejection_date AS rejectionDate
       FROM users WHERE email = ?`
    )
    .get(email) as AdminUserWithPassword | undefined;
  return row;
}

export function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  role?: string;
  verificationStatus?: string;
}) {
  const result = db
    .prepare(`INSERT INTO users (email, password_hash, name, role, verification_status) VALUES (?, ?, ?, ?, ?)`)
    .run(
      data.email,
      data.passwordHash,
      data.name,
      data.role || 'citizen',
      data.verificationStatus || 'none'
    );
  return result;
}

export function deleteUser(id: number) {
  return db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
