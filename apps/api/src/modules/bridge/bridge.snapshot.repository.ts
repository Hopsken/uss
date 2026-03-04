import { sql } from "drizzle-orm";
import type { BridgeResponse } from "@uss/shared";
import { db, schema } from "../../infra/db/client.js";

const SNAPSHOT_ID = "current";

export type BridgeSnapshotRepository = {
  saveSnapshot: (params: {
    payload: BridgeResponse;
    source: string;
    gatewayUrl: string;
  }) => Promise<void>;
  loadSnapshot: () => Promise<BridgeResponse | null>;
};

let ensureDbPromise: Promise<void> | null = null;

function ensureBridgeTables(): Promise<void> {
  if (ensureDbPromise) {
    return ensureDbPromise;
  }

  ensureDbPromise = (async () => {
    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS bootstrap_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `),
    );

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS bridge_snapshot (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        source TEXT NOT NULL,
        gateway_url TEXT,
        synced_at INTEGER NOT NULL
      );
    `),
    );
  })();

  return ensureDbPromise;
}

export const bridgeSnapshotRepository: BridgeSnapshotRepository = {
  async saveSnapshot(params): Promise<void> {
    await ensureBridgeTables();

    await db
      .insert(schema.bridgeSnapshot)
      .values({
        id: SNAPSHOT_ID,
        payload: JSON.stringify(params.payload),
        source: params.source,
        gatewayUrl: params.gatewayUrl,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.bridgeSnapshot.id,
        set: {
          payload: JSON.stringify(params.payload),
          source: params.source,
          gatewayUrl: params.gatewayUrl,
          syncedAt: new Date(),
        },
      });
  },

  async loadSnapshot(): Promise<BridgeResponse | null> {
    await ensureBridgeTables();

    const rows = await db.select().from(schema.bridgeSnapshot).limit(1);
    const row = rows.at(0);

    if (!row) {
      return null;
    }

    try {
      return JSON.parse(row.payload) as BridgeResponse;
    } catch {
      return null;
    }
  },
};
