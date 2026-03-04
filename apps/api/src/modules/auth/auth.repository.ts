import { count, sql } from 'drizzle-orm';
import { db, schema } from '../../infra/db/client.js';

let ensureAuthTablesPromise: Promise<void> | null = null;

async function ensureAuthTables(): Promise<void> {
  if (ensureAuthTablesPromise) {
    return ensureAuthTablesPromise;
  }

  ensureAuthTablesPromise = (async () => {
    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      `),
    );

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        expires_at INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL
      );
      `),
    );

    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS session_user_id_idx ON session(user_id);'));

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at INTEGER,
        refresh_token_expires_at INTEGER,
        scope TEXT,
        password TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      `),
    );

    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS account_user_id_idx ON account(user_id);'));

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      );
      `),
    );

    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);'));

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS passkey (
        id TEXT PRIMARY KEY,
        name TEXT,
        public_key TEXT NOT NULL,
        user_id TEXT NOT NULL,
        credential_id TEXT NOT NULL,
        counter INTEGER NOT NULL,
        device_type TEXT NOT NULL,
        backed_up INTEGER NOT NULL,
        transports TEXT,
        created_at INTEGER,
        aaguid TEXT
      );
      `),
    );

    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS passkey_user_id_idx ON passkey(user_id);'));
    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS passkey_credential_id_idx ON passkey(credential_id);'));
  })();

  return ensureAuthTablesPromise;
}

export const authRepository = {
  async ensureAuthReady(): Promise<void> {
    await ensureAuthTables();
  },

  async countUsers(): Promise<number> {
    await ensureAuthTables();
    const rows = await db.select({ value: count() }).from(schema.authUser);
    return rows.at(0)?.value ?? 0;
  },

  async resetAuthData(): Promise<void> {
    await ensureAuthTables();
    await db.delete(schema.authPasskey);
    await db.delete(schema.authSession);
    await db.delete(schema.authAccount);
    await db.delete(schema.authVerification);
    await db.delete(schema.authUser);
  },
};
