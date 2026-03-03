import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import type { BridgeResponse, HealthResponse } from '@uss/shared'

const port = Number(process.env.API_PORT ?? 8787)

function loadBridgeData(): BridgeResponse {
  const filePath = path.resolve(process.cwd(), '../../product-plan/sections/bridge/sample-data.json')
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as BridgeResponse & { _meta?: unknown }

  return {
    agents: raw.agents,
    recentTaskRuns: raw.recentTaskRuns,
    systemHealth: raw.systemHealth,
    usageSnapshot: raw.usageSnapshot,
  }
}

const app = new Elysia({ adapter: node() })
  .get('/v1/health', () => {
    const payload: HealthResponse = {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    }

    return payload
  })
  .get('/v1/bridge', () => loadBridgeData())
  .listen(port)

console.log(`[api] listening on http://localhost:${app.server?.port ?? port}`)
