import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { resolvedDatabasePath } from "../env.js";

fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

export const db = new Database(resolvedDatabasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export type DatabaseClient = typeof db;
