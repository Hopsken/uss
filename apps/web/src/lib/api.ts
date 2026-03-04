import type {
  AssignSkillRequest,
  AssignSkillResponse,
  UsageQuery,
  UsageResponse,
  AgentDetailResponse,
  AgentsListResponse,
  BridgeResponse,
  SaveSkillConfigRequest,
  SaveSkillConfigResponse,
  SkillsResponse,
  ToggleSkillRequest,
  ToggleSkillResponse,
  UpdateAgentModelRequest,
  UpdateAgentModelResponse,
} from '@uss/shared'
import ky, { HTTPError } from 'ky'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8787'
const api = ky.create({
  prefixUrl: API_BASE_URL,
})

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const payload = (await res.json()) as { error?: string }
    return new Error(payload.error ?? fallback)
  } catch {
    return new Error(fallback)
  }
}

async function handleApiError(error: unknown, fallback: string): Promise<never> {
  if (error instanceof HTTPError) {
    throw await parseError(error.response, `${fallback} (${error.response.status})`)
  }
  throw error
}

export async function fetchBridgeData(): Promise<BridgeResponse> {
  try {
    return await api
      .get('v1/bridge', { cache: 'no-store' })
      .json<BridgeResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch bridge data')
  }
}

export async function fetchAgentsList(): Promise<AgentsListResponse> {
  try {
    return await api
      .get('v1/agents', { cache: 'no-store' })
      .json<AgentsListResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch agents list')
  }
}

export async function fetchAgentDetail(agentId: string): Promise<AgentDetailResponse> {
  try {
    return await api
      .get(`v1/agents/${encodeURIComponent(agentId)}`, { cache: 'no-store' })
      .json<AgentDetailResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch agent detail')
  }
}

export async function updateAgentModel(
  agentId: string,
  body: UpdateAgentModelRequest,
): Promise<UpdateAgentModelResponse> {
  try {
    return await api
      .patch(`v1/agents/${encodeURIComponent(agentId)}/model`, {
        json: body,
      })
      .json<UpdateAgentModelResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to update agent model')
  }
}

export async function fetchUsage(query: UsageQuery): Promise<UsageResponse> {
  try {
    return await api
      .get('v1/usage', {
        searchParams: {
          startDate: query.startDate,
          endDate: query.endDate,
          mode: query.mode,
          utcOffset: query.utcOffset,
        },
        cache: 'no-store',
      })
      .json<UsageResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch usage')
  }
}

export async function fetchSkills(): Promise<SkillsResponse> {
  try {
    return await api
      .get('v1/skills', { cache: 'no-store' })
      .json<SkillsResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch skills')
  }
}

export async function toggleSkill(
  skillId: string,
  body: ToggleSkillRequest,
): Promise<ToggleSkillResponse> {
  try {
    return await api
      .patch(`v1/skills/${encodeURIComponent(skillId)}/toggle`, {
        json: body,
      })
      .json<ToggleSkillResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to toggle skill')
  }
}

export async function saveSkillConfig(
  skillId: string,
  body: SaveSkillConfigRequest,
): Promise<SaveSkillConfigResponse> {
  try {
    return await api
      .put(`v1/skills/${encodeURIComponent(skillId)}/config`, {
        json: body,
      })
      .json<SaveSkillConfigResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to save skill config')
  }
}

export async function assignSkill(
  skillId: string,
  body: AssignSkillRequest,
): Promise<AssignSkillResponse> {
  try {
    return await api
      .post(`v1/skills/${encodeURIComponent(skillId)}/assign`, {
        json: body,
      })
      .json<AssignSkillResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to assign skill')
  }
}
