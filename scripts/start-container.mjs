import { spawn } from 'node:child_process'

const API_PORT = Number(process.env.API_PORT ?? 8787)
const API_HEALTH_URL = process.env.API_HEALTH_URL ?? `http://127.0.0.1:${API_PORT}/v1/health`
const API_START_TIMEOUT_MS = Number(process.env.API_START_TIMEOUT_MS ?? 30000)

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForApiHealth() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < API_START_TIMEOUT_MS) {
    try {
      const response = await fetch(API_HEALTH_URL, { method: 'GET' })
      if (response.ok) {
        return
      }
    } catch {}

    await wait(400)
  }

  throw new Error(`API did not become healthy within ${API_START_TIMEOUT_MS}ms (${API_HEALTH_URL})`)
}

function spawnProcess(name, args, env = process.env) {
  const child = spawn('pnpm', args, {
    stdio: 'inherit',
    env,
  })

  child.on('error', (error) => {
    console.error(`[container] ${name} failed to spawn`, error)
  })

  return child
}

async function main() {
  console.log('[container] starting API process')
  const api = spawnProcess('api', ['--filter', '@uss/api', 'start'])

  try {
    await waitForApiHealth()
    console.log('[container] API healthy, starting web process')
  } catch (error) {
    console.error('[container] API startup failed', error)
    api.kill('SIGTERM')
    process.exit(1)
  }

  const webEnv = {
    ...process.env,
    PORT: process.env.PORT ?? '3000',
  }
  const web = spawnProcess('web', ['--filter', '@uss/web', 'start'], webEnv)

  let shuttingDown = false
  const shutdown = (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`[container] received ${signal}, shutting down`)
    api.kill('SIGTERM')
    web.kill('SIGTERM')
    setTimeout(() => {
      api.kill('SIGKILL')
      web.kill('SIGKILL')
    }, 5000).unref()
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))

  api.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`[container] api exited (code=${code}, signal=${signal})`)
      shutdown('api_exit')
    }
  })

  web.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`[container] web exited (code=${code}, signal=${signal})`)
      shutdown('web_exit')
    }
  })
}

main().catch((error) => {
  console.error('[container] fatal startup error', error)
  process.exit(1)
})
