'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskDetail } from './TaskDetail'
import {
  EmptySurfaceState,
  FilterChip,
  TaskOverlay,
  TasksToolbar,
  ToolbarSearch,
  UtilityPanel,
} from './TasksPageChrome'
import { agendaBucketLabels, agendaStateLabels, agendaStateTone, formatDueLabel } from './presentation'
import type { AgendaBucket, CreateTaskRequest, Task, TaskTemplate } from './types'
import { useTasksDashboard } from './useTasksDashboard'

type AgendaSectionKey = 'overdue' | 'today' | 'upcoming' | 'completed' | 'cancelled'

const AGENDA_SECTION_ORDER: AgendaSectionKey[] = ['overdue', 'today', 'upcoming', 'completed', 'cancelled']

function matchesSearch(task: Task, query: string): boolean {
  if (!query) return true
  const normalized = query.trim().toLowerCase()
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.agentName.toLowerCase().includes(normalized) ||
    formatDueLabel(task).toLowerCase().includes(normalized)
  )
}

function getAgendaTimestamp(task: Task): number {
  const source = task.nextRunAt ?? task.schedule.scheduledAt ?? task.createdAt
  const value = new Date(source).getTime()
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value
}

function isCompletedTask(task: Task): boolean {
  return (
    task.agendaBucket === 'completed' ||
    task.agendaBucket === 'cancelled' ||
    task.agendaState === 'done' ||
    task.agendaState === 'cancelled'
  )
}

function getAgendaSection(task: Task): AgendaSectionKey {
  if (task.agendaBucket === 'cancelled' || task.agendaState === 'cancelled') {
    return 'cancelled'
  }

  if (task.agendaBucket === 'completed' || task.agendaState === 'done') {
    return 'completed'
  }

  if (task.agendaBucket === 'overdue') return 'overdue'
  if (task.agendaBucket === 'today') return 'today'

  return 'upcoming'
}

function sortAgendaTasks(tasks: Task[]): Task[] {
  const bucketOrder: Record<AgendaBucket, number> = {
    overdue: 0,
    today: 1,
    upcoming: 2,
    completed: 3,
    cancelled: 4,
  }

  return [...tasks].sort((left, right) => {
    const leftBucket = bucketOrder[left.agendaBucket ?? 'upcoming']
    const rightBucket = bucketOrder[right.agendaBucket ?? 'upcoming']

    if (leftBucket !== rightBucket) return leftBucket - rightBucket
    return getAgendaTimestamp(left) - getAgendaTimestamp(right)
  })
}

function groupAgendaTasks(tasks: Task[]): Record<AgendaSectionKey, Task[]> {
  const grouped: Record<AgendaSectionKey, Task[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
    cancelled: [],
  }

  for (const task of sortAgendaTasks(tasks)) {
    grouped[getAgendaSection(task)].push(task)
  }

  return grouped
}

export function AgendaClient({ initialAgentFilter }: { initialAgentFilter: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [showFinished, setShowFinished] = useState(false)
  const [search, setSearch] = useState('')
  const state = useTasksDashboard(initialAgentFilter)

  const selectedTask = useMemo(
    () => state.agendaTasks.find((task) => task.id === state.selectedTaskId) ?? null,
    [state.agendaTasks, state.selectedTaskId],
  )

  const filteredTasks = useMemo(() => state.agendaTasks.filter((task) => matchesSearch(task, search)), [search, state.agendaTasks])

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1380} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <div className="px-1">
          <h1 className="text-[2rem] font-semibold tracking-tight text-slate-950" style={{ fontFamily: 'var(--font-heading)' }}>
            Agenda
          </h1>
        </div>

        {state.dashboardQuery.isPending && !state.dashboardQuery.data ? (
          <Center py="xl">
            <Loader color="sky" />
          </Center>
        ) : null}

        {state.dashboardQuery.error && !state.dashboardQuery.data ? (
          <Alert color="red" title="Unable to load agenda">
            <Stack gap="xs">
              <Text size="sm">
                {state.dashboardQuery.error instanceof Error ? state.dashboardQuery.error.message : 'Unknown error'}
              </Text>
              <Button variant="light" size="xs" w="fit-content" onClick={() => state.dashboardQuery.refetch()} loading={state.dashboardQuery.isFetching}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {state.statusError ? (
          <Alert color="red" title="Status update blocked" withCloseButton onClose={() => state.setStatusError(null)}>
            {state.statusError}
          </Alert>
        ) : null}

        {state.dashboardQuery.data ? (
          <Box
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white"
            style={{ opacity: state.busy ? 0.82 : 1 }}
          >
            <TasksToolbar
              primary={
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <ToolbarSearch value={search} onChange={setSearch} placeholder="Search agenda items or agents" />
                  {state.agentFilter ? (
                    <FilterChip
                      label={`Agent: ${state.agentFilter}`}
                      onRemove={() => {
                        state.setAgentFilter(null)
                        router.replace(pathname)
                      }}
                    />
                  ) : null}
                </div>
              }
              secondary={
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setQuickAddOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    Quick add
                  </button>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    New agenda item
                  </button>
                </div>
              }
            />

            <AgendaList
              tasks={filteredTasks}
              hasTasks={state.agendaTasks.length > 0}
              search={search}
              showFinished={showFinished}
              onToggleFinished={() => setShowFinished((current) => !current)}
              onSelectTask={state.setSelectedTaskId}
              onRunNow={state.runTaskNow}
              onChangeStatus={state.changeStatus}
            />
          </Box>
        ) : null}
      </Stack>

      <UtilityPanel
        open={quickAddOpen}
        title="Quick add"
        description="Fast path for one-time work. Use the full modal only when the task needs more structure."
        onClose={() => setQuickAddOpen(false)}
      >
        <QuickCapturePanel
          agents={state.agents}
          templates={state.templates}
          onCreate={(body) => {
            state.createTask(body)
            setQuickAddOpen(false)
          }}
          busy={state.busy}
        />
      </UtilityPanel>

      {selectedTask ? (
        <TaskOverlay onClose={() => state.setSelectedTaskId(null)}>
          <TaskDetail
            task={selectedTask}
            agents={state.agents}
            onDelete={state.deleteTask}
            onRunNow={state.runTaskNow}
            onChangeStatus={state.changeStatus}
            onReassignTask={state.reassignTask}
          />
        </TaskOverlay>
      ) : null}

      {createModalOpen ? (
        <CreateTaskModal
          agents={state.agents}
          templates={state.templates}
          defaultTaskType="one_time"
          title="New Agenda Item"
          onClose={() => setCreateModalOpen(false)}
          onSubmit={(task) => {
            state.createTask({
              title: task.title,
              instructions: task.instructions,
              agentId: task.agentId,
              schedule: task.schedule,
              templateId: task.templateId,
            })
            setCreateModalOpen(false)
          }}
        />
      ) : null}
    </Box>
  )
}

function QuickCapturePanel({
  agents,
  templates,
  onCreate,
  busy,
}: {
  agents: { id: string; name: string; role: string }[]
  templates: TaskTemplate[]
  onCreate: (body: CreateTaskRequest) => void
  busy: boolean
}) {
  const [title, setTitle] = useState('')
  const [agentId, setAgentId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  useEffect(() => {
    if (!agentId && agents[0]?.id) {
      setAgentId(agents[0].id)
    }
  }, [agentId, agents])

  const selectedTemplate = templates.find((template) => template.id === templateId)

  return (
    <div className="space-y-5 p-5">
      <Field label="Title">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Review deploy logs before standup"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white"
        />
      </Field>

      <Field label="Agent">
        <select
          value={agentId}
          onChange={(event) => setAgentId(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white"
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} - {agent.role}
            </option>
          ))}
        </select>
      </Field>

      <Field label="When">
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white"
        />
      </Field>

      <Field label="Template">
        <select
          value={templateId}
          onChange={(event) => {
            setTemplateId(event.target.value)
            const nextTemplate = templates.find((template) => template.id === event.target.value)
            if (nextTemplate?.suggestedAgentId) {
              setAgentId(nextTemplate.suggestedAgentId)
            }
          }}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white"
        >
          <option value="">No template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </Field>

      {selectedTemplate ? (
        <div className="rounded-[22px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Template selected: {selectedTemplate.name}
        </div>
      ) : null}

      <button
        disabled={!title.trim() || !agentId || busy}
        onClick={() => {
          const scheduleDate = scheduledAt || new Date().toISOString().slice(0, 16)
          onCreate({
            title: title.trim(),
            instructions: selectedTemplate?.defaultInstructions ?? '',
            agentId,
            schedule: {
              type: 'one_time',
              scheduledAt: new Date(scheduleDate).toISOString(),
              humanReadable: new Date(scheduleDate).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
            },
            templateId: templateId || null,
          })
          setTitle('')
          setTemplateId('')
          setScheduledAt('')
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Add to agenda
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      {children}
    </label>
  )
}

function AgendaList({
  tasks,
  hasTasks,
  search,
  showFinished,
  onToggleFinished,
  onSelectTask,
  onRunNow,
  onChangeStatus,
}: {
  tasks: Task[]
  hasTasks: boolean
  search: string
  showFinished: boolean
  onToggleFinished: () => void
  onSelectTask: (taskId: string) => void
  onRunNow: (taskId: string) => void
  onChangeStatus: (taskId: string, status: 'pending' | 'done' | 'cancelled') => void
}) {
  const sections = groupAgendaTasks(tasks)
  const openSections = AGENDA_SECTION_ORDER.slice(0, 3)
    .map((key) => ({ key, tasks: sections[key] }))
    .filter((section) => section.tasks.length > 0)
  const completedCount = sections.completed.length
  const cancelledCount = sections.cancelled.length
  const finishedCount = completedCount + cancelledCount

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
      {tasks.length === 0 ? (
        <EmptySurfaceState
          title={search ? 'No matching agenda items' : 'No agenda items'}
          description={
            search
              ? 'Try a different search term or clear filters to bring the list back.'
              : hasTasks
                ? 'Nothing is visible in this view right now.'
                : 'Use quick add to capture one-time work or create a richer item from the full modal.'
          }
        />
      ) : (
        <div className="space-y-6">
          {openSections.map((section) => (
            <AgendaSection
              key={section.key}
              label={agendaBucketLabels[section.key]}
              tasks={section.tasks}
              onSelectTask={onSelectTask}
              onRunNow={onRunNow}
              onChangeStatus={onChangeStatus}
            />
          ))}

          {finishedCount > 0 ? (
            <section className="rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-[0_18px_32px_-30px_rgba(15,23,42,0.4)]">
              <button
                onClick={onToggleFinished}
                className="flex w-full items-center justify-between gap-4 rounded-[22px] px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-950">Finished</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {completedCount} completed{cancelledCount ? `, ${cancelledCount} cancelled` : ''}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showFinished ? 'rotate-180' : ''}`} />
              </button>

              {showFinished ? (
                <div className="space-y-6 border-t border-slate-200 px-3 pb-3 pt-4">
                  {sections.completed.length > 0 ? (
                    <AgendaSection
                      label={agendaBucketLabels.completed}
                      tasks={sections.completed}
                      onSelectTask={onSelectTask}
                      onRunNow={onRunNow}
                      onChangeStatus={onChangeStatus}
                    />
                  ) : null}
                  {sections.cancelled.length > 0 ? (
                    <AgendaSection
                      label={agendaBucketLabels.cancelled}
                      tasks={sections.cancelled}
                      onSelectTask={onSelectTask}
                      onRunNow={onRunNow}
                      onChangeStatus={onChangeStatus}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}

function AgendaSection({
  label,
  tasks,
  onSelectTask,
  onRunNow,
  onChangeStatus,
}: {
  label: string
  tasks: Task[]
  onSelectTask: (taskId: string) => void
  onRunNow: (taskId: string) => void
  onChangeStatus: (taskId: string, status: 'pending' | 'done' | 'cancelled') => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</h2>
        <span className="text-xs font-medium text-slate-400">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <AgendaRow
            key={task.id}
            task={task}
            onSelect={() => onSelectTask(task.id)}
            onRunNow={() => onRunNow(task.id)}
            onMarkDone={() => onChangeStatus(task.id, 'done')}
            onCancel={() => onChangeStatus(task.id, 'cancelled')}
          />
        ))}
      </div>
    </section>
  )
}

function AgendaRow({
  task,
  onSelect,
  onRunNow,
  onMarkDone,
  onCancel,
}: {
  task: Task
  onSelect: () => void
  onRunNow: () => void
  onMarkDone: () => void
  onCancel: () => void
}) {
  const tone = task.agendaState ? agendaStateTone[task.agendaState] : 'border-slate-200 bg-slate-100 text-slate-600'

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_32px_-30px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <button onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
              {task.agendaState ? agendaStateLabels[task.agendaState] : 'Queued'}
            </span>
            {task.agendaBucket ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                {agendaBucketLabels[task.agendaBucket]}
              </span>
            ) : null}
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-950">{task.title}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{task.agentName}</span>
            <span>{formatDueLabel(task)}</span>
            {task.lastRunError ? <span className="text-red-600">{task.lastRunError}</span> : null}
          </div>
        </button>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {task.agendaState !== 'done' && task.agendaState !== 'cancelled' ? (
            <button
              onClick={onMarkDone}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Mark done
            </button>
          ) : null}
          {task.agendaState !== 'cancelled' ? (
            <button
              onClick={onCancel}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Cancel
            </button>
          ) : null}
          {(task.agendaState === 'queued' || task.agendaState === 'blocked') ? (
            <button
              onClick={onRunNow}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              Run now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
