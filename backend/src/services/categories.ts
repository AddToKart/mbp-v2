import { db } from "../db/client.js";
import { slugify } from "./posts.js";

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export function ensureUniqueCategorySlug(baseSlug: string, currentId?: number) {
  let slug = baseSlug;
  let suffix = 1;

  const query = currentId
    ? db.prepare("SELECT id FROM categories WHERE slug = ? AND id != ?")
    : db.prepare("SELECT id FROM categories WHERE slug = ?");

  while (true) {
    const existing = currentId ? query.get(slug, currentId) : query.get(slug);

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export function getAllCategories() {
  const rows = db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.description, c.color, c.created_at AS createdAt,
              c.updated_at AS updatedAt,
              COUNT(p.id) AS postCount
       FROM categories c
       LEFT JOIN posts p ON p.category = c.slug OR p.category = c.name
       GROUP BY c.id
       ORDER BY c.name ASC`
    )
    .all() as Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
    createdAt: string;
    updatedAt: string;
    postCount: number;
  }>;
  return rows;
}

export function getCategoryById(id: number) {
  return db
    .prepare(
      `SELECT id, name, slug, description, color, created_at, updated_at
       FROM categories WHERE id = ?`
    )
    .get(id) as CategoryRow | undefined;
}

export function createCategory(data: {
  name: string;
  slug: string;
  description: string;
  color: string;
}) {
  const statement = db.prepare(
    `INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)`
  );

  const result = statement.run(
    data.name,
    data.slug,
    data.description,
    data.color
  );

  return result;
}

export function updateCategory(
  id: number,
  updates: string[],
  values: unknown[]
) {
  const statement = db.prepare(
    `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`
  );
  return statement.run(...values, id);
}

export function updatePostCategories(
  oldSlug: string,
  oldName: string,
  newSlug: string
) {
  db.prepare("UPDATE posts SET category = ? WHERE category = ?").run(
    newSlug,
    oldSlug
  );
  db.prepare("UPDATE posts SET category = ? WHERE category = ?").run(
    newSlug,
    oldName
  );
}

export function getCategoryPostCount(slug: string, name: string) {
  const result = db
    .prepare(
      `SELECT COUNT(*) as count FROM posts WHERE category = ? OR category = ?`
    )
    .get(slug, name) as { count: number };
  return result.count;
}

export function deleteCategory(id: number) {
  return db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

export { slugify };
