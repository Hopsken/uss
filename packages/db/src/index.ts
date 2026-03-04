import path from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema.js'

function resolveDatabaseUrl(rawUrl: string): string {
  if (
    rawUrl.startsWith('file:') ||
    rawUrl.startsWith('libsql:') ||
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://')
  ) {
    return rawUrl
  }

  return `file:${path.resolve(rawUrl)}`
}

export function createDb(databaseUrl = process.env.DATABASE_URL ?? './apps/api/data/uss.db') {
  const resolvedUrl = resolveDatabaseUrl(databaseUrl)
  const client = createClient({ url: resolvedUrl })
  const db = drizzle(client, { schema })

  return { db, schema, databaseUrl: resolvedUrl }
}

export type UssDb = ReturnType<typeof createDb>['db']
export type UssSchema = ReturnType<typeof createDb>['schema']
