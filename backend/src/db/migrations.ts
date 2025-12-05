import { db } from "./client.js";

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS admins_updated_at
    AFTER UPDATE ON admins
    FOR EACH ROW
    BEGIN
      UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      tags TEXT NOT NULL DEFAULT '[]',
      featured_image TEXT,
      author_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      published_at TEXT,
      scheduled_at TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(author_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS posts_updated_at
    AFTER UPDATE ON posts
    FOR EACH ROW
    BEGIN
      UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
    CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
    CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at);

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#1d4ed8',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS categories_updated_at
    AFTER UPDATE ON categories
    FOR EACH ROW
    BEGIN
      UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS site_settings_updated_at
    AFTER UPDATE ON site_settings
    FOR EACH ROW
    BEGIN
      UPDATE site_settings SET updated_at = CURRENT_TIMESTAMP WHERE key = OLD.key;
    END;

    -- Refresh tokens table for secure token rotation
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revoked_at TEXT,
      FOREIGN KEY(user_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS refresh_tokens_token_hash_idx ON refresh_tokens(token_hash);

    -- Municipal services table
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      full_description TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'DocumentTextIcon',
      color TEXT NOT NULL DEFAULT 'blue',
      requirements TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]',
      fees TEXT NOT NULL DEFAULT '[]',
      office_hours TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL DEFAULT '',
      is_online_available INTEGER NOT NULL DEFAULT 0,
      online_form_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS services_updated_at
    AFTER UPDATE ON services
    FOR EACH ROW
    BEGIN
      UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE INDEX IF NOT EXISTS services_slug_idx ON services(slug);
    CREATE INDEX IF NOT EXISTS services_is_active_idx ON services(is_active);

    -- Job listings table for job portal
    CREATE TABLE IF NOT EXISTS job_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      company_logo TEXT,
      location TEXT NOT NULL DEFAULT 'Santa Maria, Bulacan',
      employment_type TEXT NOT NULL DEFAULT 'full-time',
      salary_range TEXT,
      description TEXT NOT NULL DEFAULT '',
      requirements TEXT NOT NULL DEFAULT '[]',
      benefits TEXT NOT NULL DEFAULT '[]',
      contact_email TEXT NOT NULL DEFAULT '',
      contact_phone TEXT,
      application_deadline TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS job_listings_updated_at
    AFTER UPDATE ON job_listings
    FOR EACH ROW
    BEGIN
      UPDATE job_listings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE INDEX IF NOT EXISTS job_listings_slug_idx ON job_listings(slug);
    CREATE INDEX IF NOT EXISTS job_listings_is_active_idx ON job_listings(is_active);

    -- Tourism attractions/events table
    CREATE TABLE IF NOT EXISTS tourism_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'attraction',
      short_description TEXT NOT NULL DEFAULT '',
      full_description TEXT NOT NULL DEFAULT '',
      featured_image TEXT,
      gallery_images TEXT NOT NULL DEFAULT '[]',
      location TEXT NOT NULL DEFAULT '',
      map_coordinates TEXT,
      opening_hours TEXT,
      entrance_fee TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      website_url TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      event_start_date TEXT,
      event_end_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS tourism_items_updated_at
    AFTER UPDATE ON tourism_items
    FOR EACH ROW
    BEGIN
      UPDATE tourism_items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE INDEX IF NOT EXISTS tourism_items_slug_idx ON tourism_items(slug);
    CREATE INDEX IF NOT EXISTS tourism_items_type_idx ON tourism_items(type);
    CREATE INDEX IF NOT EXISTS tourism_items_is_active_idx ON tourism_items(is_active);

    -- Post views tracking table for unique view counts
    CREATE TABLE IF NOT EXISTS post_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES admins(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON post_views(post_id);
    CREATE INDEX IF NOT EXISTS post_views_user_id_idx ON post_views(user_id);
    CREATE INDEX IF NOT EXISTS post_views_ip_address_idx ON post_views(ip_address);
    -- Unique constraint: one view per user per post (for logged-in users)
    CREATE UNIQUE INDEX IF NOT EXISTS post_views_user_unique_idx ON post_views(post_id, user_id) WHERE user_id IS NOT NULL;
    -- Unique constraint: one view per IP per post per day (for guests)
    CREATE UNIQUE INDEX IF NOT EXISTS post_views_ip_daily_idx ON post_views(post_id, ip_address, DATE(viewed_at)) WHERE user_id IS NULL;
  `);
}
