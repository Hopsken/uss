import type {
  ArchivedTasksResponse,
  BootstrapStartRequest,
  BootstrapStartResponse,
  BootstrapStatusResponse,
  AssignSkillRequest,
  AssignSkillResponse,
  UsageQuery,
  UsageResponse,
  CreateTaskRequest,
  CreateTaskTemplateRequest,
  AgentDetailResponse,
  AgentsListResponse,
  BridgeResponse,
  TaskMutationResponse,
  TaskReassignRequest,
  TaskRun,
  TaskStatusChangeRequest,
  TasksDashboardResponse,
  UpdateTaskRequest,
  UpdateTaskTemplateRequest,
  SaveSkillConfigRequest,
  SaveSkillConfigResponse,
  SkillsResponse,
  ToggleSkillRequest,
  ToggleSkillResponse,
  UpdateAgentModelRequest,
  UpdateAgentModelResponse,
} from '@uss/shared'
import ky, { HTTPError } from 'ky'

const API_BASE_URL = '/'
const api = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: 'include',
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

export async function fetchBootstrapStatus(): Promise<BootstrapStatusResponse> {
  try {
    return await api.get('v1/auth/bootstrap/status', { cache: 'no-store' }).json<BootstrapStatusResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch bootstrap status')
  }
}

export async function startBootstrap(body: BootstrapStartRequest): Promise<BootstrapStartResponse> {
  try {
    return await api.post('v1/auth/bootstrap/start', { json: body }).json<BootstrapStartResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to complete bootstrap')
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

export async function fetchTasksDashboard(agentId?: string): Promise<TasksDashboardResponse> {
  try {
    return await api
      .get('v1/tasks', {
        searchParams: agentId ? { agentId } : undefined,
        cache: 'no-store',
      })
      .json<TasksDashboardResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch tasks dashboard')
  }
}

export async function fetchArchivedTasks(agentId?: string): Promise<ArchivedTasksResponse> {
  try {
    return await api
      .get('v1/tasks/archived', {
        searchParams: agentId ? { agentId } : undefined,
        cache: 'no-store',
      })
      .json<ArchivedTasksResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch archived tasks')
  }
}

export async function createTask(body: CreateTaskRequest): Promise<TaskMutationResponse> {
  try {
    return await api.post('v1/tasks', { json: body }).json<TaskMutationResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to create task')
  }
}

export async function updateTask(taskId: string, body: UpdateTaskRequest): Promise<TaskMutationResponse> {
  try {
    return await api.patch(`v1/tasks/${encodeURIComponent(taskId)}`, { json: body }).json<TaskMutationResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to update task')
  }
}

export async function deleteTask(taskId: string): Promise<TaskMutationResponse> {
  try {
    return await api.delete(`v1/tasks/${encodeURIComponent(taskId)}`).json<TaskMutationResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to delete task')
  }
}

export async function runTaskNow(taskId: string): Promise<TaskMutationResponse> {
  try {
    return await api.post(`v1/tasks/${encodeURIComponent(taskId)}/run-now`).json<TaskMutationResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to run task')
  }
}

export async function changeTaskStatus(taskId: string, body: TaskStatusChangeRequest): Promise<TaskMutationResponse> {
  try {
    return await api
      .patch(`v1/tasks/${encodeURIComponent(taskId)}/status`, { json: body })
      .json<TaskMutationResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to change task status')
  }
}

export async function reassignTask(taskId: string, body: TaskReassignRequest): Promise<TaskMutationResponse> {
  try {
    return await api
      .patch(`v1/tasks/${encodeURIComponent(taskId)}/reassign`, { json: body })
      .json<TaskMutationResponse>()
  } catch (error) {
    return handleApiError(error, 'Failed to reassign task')
  }
}

export async function fetchTaskRuns(taskId: string): Promise<{ runs: TaskRun[] }> {
  try {
    return await api.get(`v1/tasks/${encodeURIComponent(taskId)}/runs`, { cache: 'no-store' }).json<{ runs: TaskRun[] }>()
  } catch (error) {
    return handleApiError(error, 'Failed to fetch task runs')
  }
}

export async function createTaskTemplate(body: CreateTaskTemplateRequest): Promise<{ ok: true }> {
  try {
    return await api.post('v1/tasks/templates', { json: body }).json<{ ok: true }>()
  } catch (error) {
    return handleApiError(error, 'Failed to create template')
  }
}

export async function updateTaskTemplate(templateId: string, body: UpdateTaskTemplateRequest): Promise<{ ok: true }> {
  try {
    return await api.patch(`v1/tasks/templates/${encodeURIComponent(templateId)}`, { json: body }).json<{ ok: true }>()
  } catch (error) {
    return handleApiError(error, 'Failed to update template')
  }
}

export async function deleteTaskTemplate(templateId: string): Promise<{ ok: true }> {
  try {
    return await api.delete(`v1/tasks/templates/${encodeURIComponent(templateId)}`).json<{ ok: true }>()
  } catch (error) {
    return handleApiError(error, 'Failed to delete template')
  }
}
