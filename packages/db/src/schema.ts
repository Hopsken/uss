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

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  instructionsBase: text('instructions_base').notNull(),
  agentId: text('agent_id').notNull(),
  status: text('status').notNull(),
  scheduleJson: text('schedule_json').notNull(),
  templateId: text('template_id'),
  nextRunAtUtc: integer('next_run_at_utc', { mode: 'timestamp_ms' }),
  lastRunAtUtc: integer('last_run_at_utc', { mode: 'timestamp_ms' }),
  lastRunStatus: text('last_run_status').notNull(),
  lastRunError: text('last_run_error'),
  lockOwner: text('lock_owner'),
  lockUntilUtc: integer('lock_until_utc', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp_ms' }),
})

export const taskRuns = sqliteTable('task_runs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  trigger: text('trigger').notNull(),
  status: text('status').notNull(),
  startedAtUtc: integer('started_at_utc', { mode: 'timestamp_ms' }).notNull(),
  endedAtUtc: integer('ended_at_utc', { mode: 'timestamp_ms' }),
  openclawRunId: text('openclaw_run_id'),
  executionLogText: text('execution_log_text'),
  errorMessage: text('error_message'),
  idempotencyKey: text('idempotency_key').notNull(),
})

export const taskTemplates = sqliteTable('task_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  defaultInstructions: text('default_instructions').notNull(),
  suggestedAgentId: text('suggested_agent_id'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const taskChangelog = sqliteTable('task_changelog', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  detail: text('detail').notNull(),
  occurredAtUtc: integer('occurred_at_utc', { mode: 'timestamp_ms' }).notNull(),
})
