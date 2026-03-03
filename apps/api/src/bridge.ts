import { randomUUID } from 'node:crypto'
import { createDb } from '@uss/db'
import { sql } from 'drizzle-orm'
import type { BridgeAgent, BridgeResponse, OpenClawStatus, Provider, ProviderStatus, RecentTaskRun, SystemHealth, TaskRunStatus } from '@uss/shared'

const SNAPSHOT_ID = 'current'
const PROTOCOL_VERSION = 3

type JsonObject = Record<string, unknown>

type GatewayReqFrame = {
  type: 'req'
  id: string
  method: string
  params?: unknown
}

type GatewayResFrame = {
  type: 'res'
  id: string
  ok: boolean
  payload?: unknown
  error?: unknown
}

type GatewayEventFrame = {
  type: 'event'
  event: string
  payload?: unknown
}

type GatewayHelloOkFrame = {
  type: 'hello-ok'
  protocol?: number
  server?: {
    version?: string
  }
  snapshot?: {
    uptimeMs?: number
  }
}

type GatewayFrame = GatewayResFrame | GatewayEventFrame | GatewayHelloOkFrame | { type?: string }

type GatewayBridgeRaw = {
  hello: GatewayHelloOkFrame | null
  agentsList: unknown
  status: unknown
  usageToday: unknown
  usageWeek: unknown
  usageStatus: unknown
  cronRuns: unknown
  cronList: unknown
}

type GatewayConfig = {
  url: string
  token: string | null
  timeoutMs: number
}

const { db, schema } = createDb(process.env.DATABASE_URL)
let ensureDbPromise: Promise<void> | null = null

function ensureDb(): Promise<void> {
  if (ensureDbPromise) {
    return ensureDbPromise
  }

  ensureDbPromise = (async () => {
    await db.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS bootstrap_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `))
    await db.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS bridge_snapshot (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        source TEXT NOT NULL,
        gateway_url TEXT,
        synced_at INTEGER NOT NULL
      );
    `))
  })()

  return ensureDbPromise
}

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as JsonObject
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function nowIsoFromMs(ms: number | null): string {
  return new Date(ms ?? Date.now()).toISOString()
}

function resolveGatewayConfig(): GatewayConfig {
  const timeoutRaw = Number(process.env.OPENCLAW_GATEWAY_TIMEOUT_MS ?? 8000)

  return {
    url: process.env.OPENCLAW_GATEWAY_URL ?? 'ws://localhost:18789',
    token: process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || null,
    timeoutMs: Number.isFinite(timeoutRaw) ? Math.max(1000, timeoutRaw) : 8000,
  }
}

function normalizeProviderStatus(entry: JsonObject): ProviderStatus {
  const error = asString(entry.error)
  const windows = asArray(entry.windows)

  if (error) {
    return 'down'
  }

  return windows.length > 0 ? 'healthy' : 'degraded'
}

function normalizeTaskRunStatus(value: unknown): TaskRunStatus {
  if (value === 'ok') {
    return 'completed'
  }
  if (value === 'error') {
    return 'failed'
  }
  if (value === 'skipped') {
    return 'scheduled'
  }
  if (value === 'running') {
    return 'running'
  }

  return 'scheduled'
}

function inferOpenClawStatus(params: { uptimeSeconds: number; hadError: boolean }): OpenClawStatus {
  if (params.hadError) {
    return 'error'
  }

  return params.uptimeSeconds > 0 ? 'running' : 'stopped'
}

function pickArrayPayload(payload: unknown, keys: string[]): JsonObject[] {
  const direct = asArray<JsonObject>(payload)
  if (direct.length > 0) {
    return direct
  }

  const obj = asObject(payload)
  if (!obj) {
    return []
  }

  for (const key of keys) {
    const arr = asArray<JsonObject>(obj[key])
    if (arr.length > 0) {
      return arr
    }
  }

  return []
}

function isHelloOkFrame(frame: unknown): frame is GatewayHelloOkFrame {
  const obj = asObject(frame)
  return obj?.type === 'hello-ok'
}

function isResponseFrame(frame: unknown): frame is GatewayResFrame {
  const obj = asObject(frame)
  return obj?.type === 'res' && typeof obj.id === 'string' && typeof obj.ok === 'boolean'
}

function toWsText(data: unknown): string {
  if (typeof data === 'string') {
    return data
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString('utf8')
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('utf8')
  }
  return String(data)
}

async function callGateway(config: GatewayConfig): Promise<GatewayBridgeRaw> {
  const ws = new WebSocket(config.url)
  let hello: GatewayHelloOkFrame | null = null

  const pending = new Map<
    string,
    {
      resolve: (value: GatewayResFrame) => void
      reject: (error: Error) => void
      timer: ReturnType<typeof setTimeout>
    }
  >()

  const waitOpen = () =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Gateway open timeout')), config.timeoutMs)

      const onOpen = () => {
        clearTimeout(timer)
        ws.removeEventListener('error', onError)
        resolve()
      }

      const onError = (event: Event) => {
        clearTimeout(timer)
        ws.removeEventListener('open', onOpen)
        const error = 'error' in event ? (event.error as unknown) : event
        reject(error instanceof Error ? error : new Error(String(error)))
      }

      ws.addEventListener('open', onOpen, { once: true })
      ws.addEventListener('error', onError, { once: true })
    })

  const request = (method: string, params?: unknown, timeoutMs = config.timeoutMs) =>
    new Promise<unknown>((resolve, reject) => {
      const id = randomUUID()
      const frame: GatewayReqFrame = {
        type: 'req',
        id,
        method,
        params,
      }

      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`Gateway request timeout: ${method}`))
      }, timeoutMs)

      pending.set(id, {
        resolve: (res) => {
          if (!res.ok) {
            reject(new Error(`Gateway method failed: ${method}`))
            return
          }

          resolve(res.payload)
        },
        reject,
        timer,
      })

      ws.send(JSON.stringify(frame))
    })

  ws.addEventListener('message', (event: MessageEvent) => {
    let frame: GatewayFrame | null = null

    try {
      frame = JSON.parse(toWsText(event.data)) as GatewayFrame
    } catch {
      return
    }

    if (isHelloOkFrame(frame)) {
      hello = frame
      return
    }

    if (!isResponseFrame(frame)) {
      return
    }

    const waiter = pending.get(frame.id)
    if (!waiter) {
      return
    }

    pending.delete(frame.id)
    clearTimeout(waiter.timer)
    waiter.resolve(frame)
  })

  try {
    await waitOpen()

    const connectParams: JsonObject = {
      minProtocol: PROTOCOL_VERSION,
      maxProtocol: PROTOCOL_VERSION,
      client: {
        id: 'openclaw-ui',
        displayName: 'USS Bridge API',
        version: '0.1.0',
        platform: `node ${process.version}`,
        mode: 'ui',
        instanceId: 'uss-bridge-api',
      },
      role: 'operator',
      scopes: ['operator.read'],
      caps: [],
      locale: 'en-US',
      userAgent: 'uss-bridge-api',
    }

    if (config.token) {
      connectParams.auth = { token: config.token }
    }

    await request('connect', connectParams, config.timeoutMs)

    const [agentsList, status, usageToday, usageWeek, usageStatus, cronRuns, cronList] =
      await Promise.all([
        request('agents.list', {}),
        request('status', {}),
        request('usage.cost', { days: 1, mode: 'utc' }),
        request('usage.cost', { days: 7, mode: 'utc' }),
        request('usage.status', {}),
        request('cron.runs', { scope: 'all', limit: 8, sortDir: 'desc' }),
        request('cron.list', { includeDisabled: true, limit: 200 }),
      ])

    return {
      hello,
      agentsList,
      status,
      usageToday,
      usageWeek,
      usageStatus,
      cronRuns,
      cronList,
    }
  } finally {
    for (const waiter of pending.values()) {
      clearTimeout(waiter.timer)
      waiter.reject(new Error('Gateway connection closed'))
    }
    pending.clear()
    ws.close()
  }
}

function mapBridgePayload(raw: GatewayBridgeRaw): BridgeResponse {
  const agentsPayload = asObject(raw.agentsList)
  const statusPayload = asObject(raw.status)
  const usageTodayPayload = asObject(raw.usageToday)
  const usageWeekPayload = asObject(raw.usageWeek)
  const usageStatusPayload = asObject(raw.usageStatus)
  const cronListPayload = asObject(raw.cronList)
  const statusSessions = asObject(statusPayload?.sessions)

  const cronRunsEntries = pickArrayPayload(raw.cronRuns, ['entries', 'runs', 'items'])

  const jobs = asArray<JsonObject>(cronListPayload?.jobs)
  const runningJobByAgent = new Map<string, string>()
  for (const job of jobs) {
    const agentId = asString(job.agentId)
    const name = asString(job.name)
    const state = asObject(job.state)
    const runningAtMs = asNumber(state?.runningAtMs)

    if (agentId && name && runningAtMs) {
      runningJobByAgent.set(agentId, name)
    }
  }

  const statusByAgent = new Map<string, BridgeAgent['status']>()
  const modelByAgent = new Map<string, string>()
  const statusByAgentRaw = asArray<JsonObject>(statusSessions?.byAgent)

  for (const entry of statusByAgentRaw) {
    const agentId = asString(entry.agentId)
    if (!agentId) {
      continue
    }

    const recent = asArray<JsonObject>(entry.recent)
    const newest = recent[0]
    const updatedAt = asNumber(newest ? newest.updatedAt : null)
    const flags = asArray<string>(newest ? newest.flags : null)
    const model = asString(newest ? newest.model : null)

    if (model) {
      modelByAgent.set(agentId, model)
    }

    if (flags.includes('aborted')) {
      statusByAgent.set(agentId, 'error')
      continue
    }

    if (updatedAt && Date.now() - updatedAt <= 5 * 60 * 1000) {
      statusByAgent.set(agentId, 'busy')
      continue
    }

    statusByAgent.set(agentId, 'idle')
  }

  const listedAgents = asArray<JsonObject>(agentsPayload?.agents)
  const agents: BridgeAgent[] = listedAgents.map((entry) => {
    const id = asString(entry.id) ?? randomUUID()
    const name = asString(entry.name) ?? asString(asObject(entry.identity)?.name) ?? id

    return {
      id,
      name,
      role: 'Agent',
      avatarUrl: null,
      model: modelByAgent.get(id) ?? 'unknown',
      status: statusByAgent.get(id) ?? (runningJobByAgent.has(id) ? 'busy' : 'idle'),
      currentTask: runningJobByAgent.get(id) ?? null,
    }
  })

  const recentTaskRuns: RecentTaskRun[] = cronRunsEntries.slice(0, 8).map((entry, idx) => {
    const jobId = asString(entry.jobId) ?? `job-${idx}`
    const jobName = asString(entry.jobName) ?? jobId
    const startedAtMs = asNumber(entry.runAtMs) ?? asNumber(entry.ts)
    const durationMs = asNumber(entry.durationMs)
    const agentMatch = jobs.find((job) => asString(job.id) === jobId)
    const agentId = asString(agentMatch ? agentMatch.agentId : null) ?? 'unknown'
    const agentName =
      agents.find((agent) => agent.id === agentId)?.name ??
      (agentId === 'unknown' ? 'Unknown' : agentId)
    const startedAt = nowIsoFromMs(startedAtMs)

    return {
      id: `run-${jobId}-${startedAtMs ?? idx}`,
      taskName: jobName,
      agentId,
      agentName,
      status: normalizeTaskRunStatus(entry.status),
      startedAt,
      completedAt: durationMs && startedAtMs ? nowIsoFromMs(startedAtMs + durationMs) : null,
      error: asString(entry.error),
    }
  })

  const providerStatusEntries = asArray<JsonObject>(usageStatusPayload?.providers)

  const providerModels = new Map<string, string[]>()
  const statusRecent = asArray<JsonObject>(statusSessions?.recent)
  for (const row of statusRecent) {
    const provider = asString(row.modelProvider)
    const model = asString(row.model)
    if (!provider || !model) {
      continue
    }

    const current = providerModels.get(provider) ?? []
    if (!current.includes(model)) {
      current.push(model)
    }
    providerModels.set(provider, current)
  }

  const providers: Provider[] = providerStatusEntries.map((entry) => {
    const providerId = asString(entry.provider) ?? randomUUID()

    return {
      id: providerId,
      name: asString(entry.displayName) ?? providerId,
      status: normalizeProviderStatus(entry),
      latencyMs: 0,
      models: providerModels.get(providerId) ?? [],
    }
  })

  const recentErrors = recentTaskRuns
    .filter((run) => run.status === 'failed' && run.error)
    .slice(0, 4)
    .map((run, idx) => ({
      id: `err-task-${idx}`,
      level: 'error' as const,
      message: run.error ?? 'Task failed',
      agentId: run.agentId,
      agentName: run.agentName,
      taskName: run.taskName,
      occurredAt: run.completedAt ?? run.startedAt,
    }))

  const providerErrors = providerStatusEntries
    .filter((entry) => asString(entry.error))
    .slice(0, 4)
    .map((entry, idx) => ({
      id: `err-provider-${idx}`,
      level: 'warning' as const,
      message: asString(entry.error) ?? 'Provider error',
      agentId: null,
      agentName: null,
      taskName: null,
      occurredAt: new Date().toISOString(),
    }))

  const uptimeSeconds = Math.max(0, Math.floor((asNumber(raw.hello?.snapshot?.uptimeMs) ?? 0) / 1000))
  const systemHealth: SystemHealth = {
    openclaw: {
      status: inferOpenClawStatus({
        uptimeSeconds,
        hadError: providerErrors.length > 0,
      }),
      uptimeSeconds,
      version: asString(raw.hello?.server?.version) ?? 'unknown',
    },
    providers,
    recentErrors: [...recentErrors, ...providerErrors].slice(0, 6),
  }

  const todayTotals = asObject(usageTodayPayload?.totals)
  const weekTotals = asObject(usageWeekPayload?.totals)

  const usageSnapshot = {
    today: {
      costUsd: asNumber(todayTotals?.totalCost) ?? 0,
      tokens: Math.round(asNumber(todayTotals?.totalTokens) ?? 0),
      conversations: Math.max(0, asArray(asObject(usageTodayPayload)?.sessions).length),
    },
    thisWeek: {
      costUsd: asNumber(weekTotals?.totalCost) ?? 0,
      tokens: Math.round(asNumber(weekTotals?.totalTokens) ?? 0),
      conversations: Math.max(0, asArray(asObject(usageWeekPayload)?.sessions).length),
    },
  }

  return {
    agents,
    recentTaskRuns,
    systemHealth,
    usageSnapshot,
  }
}

async function saveSnapshot(params: {
  payload: BridgeResponse
  source: string
  gatewayUrl: string
}): Promise<void> {
  await ensureDb()
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
    })
}

async function loadSnapshot(): Promise<BridgeResponse | null> {
  await ensureDb()
  const rows = await db.select().from(schema.bridgeSnapshot).limit(1)
  const row = rows[0]

  if (!row) {
    return null
  }

  try {
    return JSON.parse(row.payload) as BridgeResponse
  } catch {
    return null
  }
}

export async function loadBridgeData(): Promise<BridgeResponse> {
  const gatewayConfig = resolveGatewayConfig()

  try {
    const gatewayRaw = await callGateway(gatewayConfig)
    const payload = mapBridgePayload(gatewayRaw)
    await saveSnapshot({
      payload,
      source: 'gateway',
      gatewayUrl: gatewayConfig.url,
    })

    return payload
  } catch {
    const fallback = await loadSnapshot()

    if (fallback) {
      return fallback
    }

    throw new Error('OpenClaw gateway unavailable and no cached bridge snapshot found in database')
  }
}
