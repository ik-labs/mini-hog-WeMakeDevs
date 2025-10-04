import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Feature Flags table
export const featureFlags = sqliteTable('feature_flags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  rolloutPercentage: integer('rollout_percentage').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Flag Decisions table (for sticky bucketing)
export const flagDecisions = sqliteTable('flag_decisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  distinctId: text('distinct_id').notNull(),
  flagKey: text('flag_key').notNull(),
  variant: text('variant').notNull(),
  hashValue: real('hash_value').notNull(),
  decidedAt: text('decided_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// API Keys table
export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  lastUsedAt: text('last_used_at'),
});

// Types
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;

export type FlagDecision = typeof flagDecisions.$inferSelect;
export type NewFlagDecision = typeof flagDecisions.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
