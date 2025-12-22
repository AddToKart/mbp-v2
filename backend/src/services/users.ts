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

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  verificationStatus?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsersResult {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getUsersWithPagination(params: GetUsersParams): PaginatedUsersResult {
  const {
    page = 1,
    limit = 25,
    role,
    verificationStatus,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  // Build WHERE conditions
  if (role && role !== 'all') {
    conditions.push('role = ?');
    values.push(role);
  }

  if (verificationStatus && verificationStatus !== 'all') {
    conditions.push('verification_status = ?');
    values.push(verificationStatus);
  }

  if (search && search.trim()) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    const searchPattern = `%${search.trim()}%`;
    values.push(searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ['created_at', 'name', 'email', 'role', 'verification_status'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
  const countResult = db.prepare(countQuery).get(...values) as { total: number };
  const total = countResult.total;

  // Get paginated results
  const query = `
    SELECT id, email, name, role, verification_status AS verificationStatus, 
           created_at AS createdAt, updated_at AS updatedAt
    FROM users 
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(query).all(...values, limit, offset) as AdminUser[];

  return {
    users: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export function getUserStats() {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
      SUM(CASE WHEN role = 'validator' THEN 1 ELSE 0 END) as validators,
      SUM(CASE WHEN role = 'citizen' THEN 1 ELSE 0 END) as citizens,
      SUM(CASE WHEN verification_status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN verification_status = 'none' THEN 1 ELSE 0 END) as unverified
    FROM users
  `).get() as {
    total: number;
    admins: number;
    validators: number;
    citizens: number;
    approved: number;
    pending: number;
    rejected: number;
    unverified: number;
  };
  return stats;
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

export function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: string;
    verificationStatus?: string;
  }
) {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.name) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.email) {
    updates.push('email = ?');
    values.push(data.email);
  }
  if (data.passwordHash) {
    updates.push('password_hash = ?');
    values.push(data.passwordHash);
  }
  if (data.role) {
    updates.push('role = ?');
    values.push(data.role);
  }
  if (data.verificationStatus) {
    updates.push('verification_status = ?');
    values.push(data.verificationStatus);
  }

  if (updates.length === 0) return;

  values.push(id);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  return db.prepare(query).run(...values);
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
