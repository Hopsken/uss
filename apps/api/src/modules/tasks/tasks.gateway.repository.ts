import { gatewayClient } from '../../infra/gateway/client.js'

type AgentWaitStatus = 'ok' | 'error' | 'timeout'

export type AgentWaitResult = {
  status: AgentWaitStatus
  error: string | null
}

export type TasksGatewayRepository = {
  fetchAgents: () => Promise<Array<{ id: string; name: string; role: string }>>
  runAgent: (params: { agentId: string; message: string; idempotencyKey: string }) => Promise<{ runId: string }>
  waitForAgent: (runId: string) => Promise<AgentWaitResult>
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export const tasksGatewayRepository: TasksGatewayRepository = {
  async fetchAgents() {
    await gatewayClient.ensureConnected()
    const payload = await gatewayClient.request('agents.list', {})
    const obj = asObject(payload)
    const agents = asArray<Record<string, unknown>>(obj?.agents)

    return agents.map((entry) => {
      const id = asString(entry.id) ?? 'unknown'
      const name = asString(entry.name) ?? id
      return {
        id,
        name,
        role: asString(entry.role) ?? 'Agent',
      }
    })
  },

  async runAgent(params) {
    await gatewayClient.ensureConnected()

    const payload = await gatewayClient.request('agent', {
      message: params.message,
      agentId: params.agentId,
      idempotencyKey: params.idempotencyKey,
    })

    const obj = asObject(payload)
    const runId = asString(obj?.runId)
    if (!runId) {
      throw new Error('agent method did not return runId')
    }

    return { runId }
  },

  async waitForAgent(runId) {
    await gatewayClient.ensureConnected()

    for (let i = 0; i < 30; i++) {
      const payload = await gatewayClient.request('agent.wait', {
        runId,
        timeoutMs: 2_000,
      })

      const obj = asObject(payload)
      const status = asString(obj?.status)
      if (status === 'ok' || status === 'error') {
        return {
          status,
          error: asString(obj?.error),
        }
      }
    }

    return {
      status: 'timeout',
      error: 'agent.wait timeout',
    }
  },
}
