import 'dotenv/config'
import { Elysia } from 'elysia'
import type { HealthResponse } from '@uss/shared'

const port = Number(process.env.API_PORT ?? 8787)

const app = new Elysia()
  .get('/v1/health', () => {
    const payload: HealthResponse = {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    }

    return payload
  })
  .listen(port)

console.log(`[api] listening on http://localhost:${app.server?.port ?? port}`)
