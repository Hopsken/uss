import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const bootstrapMeta = sqliteTable('bootstrap_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const bridgeSnapshot = sqliteTable('bridge_snapshot', {
  id: text('id').primaryKey(),
  payload: text('payload').notNull(),
  source: text('source').notNull(),
  gatewayUrl: text('gateway_url'),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' }).notNull(),
})

export const usageCache = sqliteTable('usage_cache', {
  cacheKey: text('cache_key').primaryKey(),
  queryJson: text('query_json').notNull(),
  payloadJson: text('payload_json').notNull(),
  fetchedAt: integer('fetched_at_ms', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: integer('expires_at_ms', { mode: 'timestamp_ms' }).notNull(),
  sourceUpdatedAt: integer('source_updated_at_ms', { mode: 'timestamp_ms' }),
  rangeDays: integer('range_days').notNull(),
})
