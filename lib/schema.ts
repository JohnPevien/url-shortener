import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Links Table (The "Read Heavy" table)
// Replicated to all edges.
export const links = sqliteTable('links', {
  slug: text('slug').primaryKey(), // e.g., "cv", "youtube"
  url: text('url').notNull(),      // e.g., "https://youtube.com/..."
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// 2. Analytics Table (The "Write Heavy" table)
// Writes always go to Primary.
export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').references(() => links.slug, { onDelete: 'cascade' }),
  country: text('country'),
  city: text('city'),
  device: text('device'),   // "Mobile", "Desktop"
  browser: text('browser'),
  os: text('os'),
  referrer: text('referrer'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
