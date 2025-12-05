import { db } from "../db/client.js";
import bcrypt from "bcryptjs";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserWithPassword extends AdminUser {
  passwordHash: string;
}

export function getAllUsers() {
  const rows = db
    .prepare(
      `SELECT id, email, name, created_at AS createdAt, updated_at AS updatedAt
       FROM admins ORDER BY created_at DESC`
    )
    .all() as AdminUser[];
  return rows;
}

export function getUserById(id: number) {
  const row = db
    .prepare(
      `SELECT id, email, name, created_at AS createdAt, updated_at AS updatedAt
       FROM admins WHERE id = ?`
    )
    .get(id) as AdminUser | undefined;
  return row;
}

export function getUserByEmail(email: string) {
  const row = db.prepare("SELECT id FROM admins WHERE email = ?").get(email) as
    | { id: number }
    | undefined;
  return row;
}

export function getUserWithPasswordByEmail(email: string) {
  const row = db
    .prepare(
      "SELECT id, email, password_hash as passwordHash, name FROM admins WHERE email = ?"
    )
    .get(email) as AdminUserWithPassword | undefined;
  return row;
}

export function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const result = db
    .prepare(`INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)`)
    .run(data.email, data.passwordHash, data.name);
  return result;
}

export function deleteUser(id: number) {
  return db.prepare("DELETE FROM admins WHERE id = ?").run(id);
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
