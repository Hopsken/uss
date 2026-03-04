import type {
  AgentDetailResponse,
  AgentsListResponse,
  BridgeResponse,
  UpdateAgentModelRequest,
  UpdateAgentModelResponse,
} from '@uss/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8787'

export async function fetchBridgeData(): Promise<BridgeResponse> {
  const res = await fetch(`${API_BASE_URL}/v1/bridge`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Failed to fetch bridge data: ${res.status}`)
  }

  return (await res.json()) as BridgeResponse
}

async function parseError(res: Response): Promise<Error> {
  try {
    const payload = (await res.json()) as { error?: string }
    return new Error(payload.error ?? `Request failed (${res.status})`)
  } catch {
    return new Error(`Request failed (${res.status})`)
  }
}

export async function fetchAgentsList(): Promise<AgentsListResponse> {
  const res = await fetch(`${API_BASE_URL}/v1/agents`, { cache: 'no-store' })

  if (!res.ok) {
    throw await parseError(res)
  }

  return (await res.json()) as AgentsListResponse
}

export async function fetchAgentDetail(agentId: string): Promise<AgentDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/v1/agents/${encodeURIComponent(agentId)}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return (await res.json()) as AgentDetailResponse
}

export async function updateAgentModel(
  agentId: string,
  body: UpdateAgentModelRequest,
): Promise<UpdateAgentModelResponse> {
  const res = await fetch(`${API_BASE_URL}/v1/agents/${encodeURIComponent(agentId)}/model`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return (await res.json()) as UpdateAgentModelResponse
}
