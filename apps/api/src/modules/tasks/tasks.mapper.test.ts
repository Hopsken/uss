import test from 'node:test'
import assert from 'node:assert/strict'
import { mapTask } from './tasks.mapper.js'
import type { LocalTaskRecord } from './tasks.local.repository.js'

function makeTask(overrides: Partial<LocalTaskRecord>): LocalTaskRecord {
  const now = Date.now()
  return {
    id: 'task-1',
    title: 'Task',
    instructionsBase: 'Do it',
    agentId: 'agent-1',
    status: 'pending',
    schedule: {
      type: 'recurring',
      preset: 'daily',
      humanReadable: 'Daily',
    },
    templateId: null,
    nextRunAtUtc: now + 2 * 24 * 60 * 60 * 1000,
    lastRunAtUtc: null,
    lastRunStatus: 'never',
    lastRunError: null,
    lockOwner: null,
    lockUntilUtc: null,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    ...overrides,
  }
}

const agentById = new Map([
  ['agent-1', { id: 'agent-1', name: 'Agent One', role: 'Operator' }],
])

test('mapTask derives recurring attention state from failed automation', () => {
  const task = makeTask({
    status: 'failed',
    lastRunStatus: 'failed',
  })

  const mapped = mapTask({
    task,
    agentById,
    changelog: [],
    latestRun: null,
  })

  assert.equal(mapped.automationStatus, 'attention')
})

test('mapTask derives recurring due soon state when next run is close', () => {
  const task = makeTask({
    nextRunAtUtc: Date.now() + 2 * 60 * 60 * 1000,
  })

  const mapped = mapTask({
    task,
    agentById,
    changelog: [],
    latestRun: null,
  })

  assert.equal(mapped.automationStatus, 'due_soon')
  assert.ok(mapped.nextRunAt)
})

test('mapTask derives completed agenda bucket for completed one-time task', () => {
  const endedAt = Date.now() - 30 * 60 * 1000
  const task = makeTask({
    status: 'done',
    schedule: {
      type: 'one_time',
      scheduledAt: new Date(endedAt).toISOString(),
      humanReadable: 'Today',
    },
    nextRunAtUtc: endedAt,
    lastRunAtUtc: endedAt,
    lastRunStatus: 'success',
  })

  const mapped = mapTask({
    task,
    agentById,
    changelog: [],
    latestRun: null,
  })

  assert.equal(mapped.agendaBucket, 'completed')
  assert.equal(mapped.agendaState, 'done')
})

test('mapTask derives overdue agenda bucket for pending one-time task in the past', () => {
  const overdueAt = Date.now() - 2 * 60 * 60 * 1000
  const task = makeTask({
    schedule: {
      type: 'one_time',
      scheduledAt: new Date(overdueAt).toISOString(),
      humanReadable: 'Earlier today',
    },
    nextRunAtUtc: overdueAt,
  })

  const mapped = mapTask({
    task,
    agentById,
    changelog: [],
    latestRun: null,
  })

  assert.equal(mapped.agendaBucket, 'overdue')
  assert.equal(mapped.agendaState, 'queued')
})

test('mapTask suppresses board-derived labels for archived tasks', () => {
  const task = makeTask({
    status: 'archived',
    schedule: {
      type: 'one_time',
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      humanReadable: 'Soon',
    },
  })

  const mapped = mapTask({
    task,
    agentById,
    changelog: [],
    latestRun: null,
  })

  assert.equal(mapped.agendaBucket, undefined)
  assert.equal(mapped.agendaState, undefined)
  assert.equal(mapped.automationStatus, undefined)
})
