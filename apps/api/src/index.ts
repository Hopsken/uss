import 'dotenv/config'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import type { HealthResponse } from '@uss/shared'
import { loadBridgeData } from './bridge'

const port = Number(process.env.API_PORT ?? 8787)

const app = new Elysia({ adapter: node() })
  .get('/v1/health', () => {
    const payload: HealthResponse = {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    }

    return payload
  })
  .get('/v1/bridge', async () => await loadBridgeData())
  .listen(port)

console.log(`[api] listening on http://localhost:${app.server?.port ?? port}`)
