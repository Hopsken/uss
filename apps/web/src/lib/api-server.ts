import type {
  AgentDetailResponse,
  AgentsListResponse,
  BridgeResponse,
  SkillsResponse,
  TasksDashboardResponse,
  UsageQuery,
  UsageResponse,
} from '@uss/shared'
import { headers } from 'next/headers'

const API_BASE_URL = process.env.API_INTERNAL_BASE_URL ?? 'http://127.0.0.1:8787'

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headerStore = await headers()
  const cookie = headerStore.get('cookie')

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
  })

  if (!response.ok) {
    let message = `API request failed (${response.status})`
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) {
        message = payload.error
      }
    } catch {}

    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function fetchBridgeDataServer(): Promise<BridgeResponse> {
  return requestJson<BridgeResponse>('v1/bridge')
}

export async function fetchAgentsListServer(): Promise<AgentsListResponse> {
  return requestJson<AgentsListResponse>('v1/agents')
}

export async function fetchAgentDetailServer(agentId: string): Promise<AgentDetailResponse> {
  return requestJson<AgentDetailResponse>(`v1/agents/${encodeURIComponent(agentId)}`)
}

export async function fetchUsageServer(query: UsageQuery): Promise<UsageResponse> {
  const params = new URLSearchParams({
    startDate: query.startDate,
    endDate: query.endDate,
    mode: query.mode ?? 'utc',
    utcOffset: query.utcOffset ?? '+00:00',
  })

  return requestJson<UsageResponse>(`v1/usage?${params.toString()}`)
}

export async function fetchTasksDashboardServer(agentId?: string): Promise<TasksDashboardResponse> {
  const params = new URLSearchParams()
  if (agentId) {
    params.set('agentId', agentId)
  }

  const path = params.size > 0 ? `v1/tasks?${params.toString()}` : 'v1/tasks'
  return requestJson<TasksDashboardResponse>(path)
}

export async function fetchSkillsServer(): Promise<SkillsResponse> {
  return requestJson<SkillsResponse>('v1/skills')
}
