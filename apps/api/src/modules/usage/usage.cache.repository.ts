import { eq, lt, sql } from "drizzle-orm";
import type { UsageQuery, UsageResponse } from "@uss/shared";
import { db, schema } from "../../infra/db/client.js";

type CachedUsagePayload = {
  query: UsageQuery;
  payload: UsageResponse;
  fetchedAtMs: number;
  expiresAtMs: number;
  sourceUpdatedAtMs: number | null;
  rangeDays: number;
};

export type UsageCacheRepository = {
  loadByKey: (cacheKey: string) => Promise<CachedUsagePayload | null>;
  save: (params: {
    cacheKey: string;
    query: UsageQuery;
    payload: UsageResponse;
    fetchedAtMs: number;
    expiresAtMs: number;
    sourceUpdatedAtMs: number | null;
    rangeDays: number;
  }) => Promise<void>;
  pruneBefore: (timestampMs: number) => Promise<void>;
};

let ensureDbPromise: Promise<void> | null = null;

function ensureUsageTables(): Promise<void> {
  if (ensureDbPromise) {
    return ensureDbPromise;
  }

  ensureDbPromise = (async () => {
    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS usage_cache (
        cache_key TEXT PRIMARY KEY,
        query_json TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        fetched_at_ms INTEGER NOT NULL,
        expires_at_ms INTEGER NOT NULL,
        source_updated_at_ms INTEGER,
        range_days INTEGER NOT NULL
      );
    `),
    );
  })();

  return ensureDbPromise;
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const usageCacheRepository: UsageCacheRepository = {
  async loadByKey(cacheKey): Promise<CachedUsagePayload | null> {
    await ensureUsageTables();

    const rows = await db
      .select()
      .from(schema.usageCache)
      .where(eq(schema.usageCache.cacheKey, cacheKey))
      .limit(1);

    const row = rows.at(0);
    if (!row) {
      return null;
    }

    const query = parseJson<UsageQuery>(row.queryJson);
    const payload = parseJson<UsageResponse>(row.payloadJson);

    if (!query || !payload) {
      return null;
    }

    return {
      query,
      payload,
      fetchedAtMs: row.fetchedAt.getTime(),
      expiresAtMs: row.expiresAt.getTime(),
      sourceUpdatedAtMs: row.sourceUpdatedAt ? row.sourceUpdatedAt.getTime() : null,
      rangeDays: row.rangeDays,
    };
  },

  async save(params): Promise<void> {
    await ensureUsageTables();

    await db
      .insert(schema.usageCache)
      .values({
        cacheKey: params.cacheKey,
        queryJson: JSON.stringify(params.query),
        payloadJson: JSON.stringify(params.payload),
        fetchedAt: new Date(params.fetchedAtMs),
        expiresAt: new Date(params.expiresAtMs),
        sourceUpdatedAt: params.sourceUpdatedAtMs ? new Date(params.sourceUpdatedAtMs) : null,
        rangeDays: params.rangeDays,
      })
      .onConflictDoUpdate({
        target: schema.usageCache.cacheKey,
        set: {
          queryJson: JSON.stringify(params.query),
          payloadJson: JSON.stringify(params.payload),
          fetchedAt: new Date(params.fetchedAtMs),
          expiresAt: new Date(params.expiresAtMs),
          sourceUpdatedAt: params.sourceUpdatedAtMs ? new Date(params.sourceUpdatedAtMs) : null,
          rangeDays: params.rangeDays,
        },
      });
  },

  async pruneBefore(timestampMs): Promise<void> {
    await ensureUsageTables();

    await db.delete(schema.usageCache).where(lt(schema.usageCache.fetchedAt, new Date(timestampMs)));
  },
};
