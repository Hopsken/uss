import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const bootstrapMeta = sqliteTable('bootstrap_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})
