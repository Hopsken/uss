'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, CircleSlash2, ListChecks, Plus, X } from 'lucide-react'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskDetail } from './TaskDetail'
import { agendaBucketLabels, agendaStateLabels, agendaStateTone, formatDueLabel } from './presentation'
import type { AgendaBucket, CreateTaskRequest, Task, TaskTemplate } from './types'
import { useTasksDashboard } from './useTasksDashboard'

const AGENDA_BUCKETS: AgendaBucket[] = ['overdue', 'today', 'upcoming', 'completed']

export function AgendaClient({ initialAgentFilter }: { initialAgentFilter: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)
  const state = useTasksDashboard(initialAgentFilter)

  const selectedTask = useMemo(
    () => state.agendaTasks.find((task) => task.id === state.selectedTaskId) ?? null,
    [state.agendaTasks, state.selectedTaskId],
  )

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1320} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_34%),linear-gradient(135deg,_#fff7ed,_#f8fafc)] px-6 py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:18px_18px] opacity-50" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                <CalendarClock className="h-3.5 w-3.5" />
                Agenda
              </div>
              <Title order={1} ff="var(--font-heading)">
                One-time work should read like a plan for the day
              </Title>
              <Text c="dimmed" maw={700} mt="xs">
                Time-first grouping, fast completion, and fewer ambiguous statuses than the old board.
              </Text>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New agenda item
            </button>
          </div>
        </Box>

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

        {state.agentFilter ? (
          <Alert color="sky" title="Filtered by agent">
            <Stack gap="xs">
              <Text size="sm">Showing agenda items assigned to {state.agentFilter}.</Text>
              <Button
                size="xs"
                variant="light"
                w="fit-content"
                onClick={() => {
                  state.setAgentFilter(null)
                  router.replace(pathname)
                }}
              >
                Clear filter
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {state.dashboardQuery.data ? (
          <div className="grid flex-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]" style={{ minHeight: 0 }}>
            <QuickCaptureCard
              agents={state.agents}
              templates={state.templates}
              onCreate={(body) => state.createTask(body)}
              busy={state.busy}
            />

            <Box className="overflow-hidden rounded-[28px] border border-slate-200 bg-white" style={{ minHeight: 0, opacity: state.busy ? 0.84 : 1 }}>
              <AgendaPanel
                tasks={state.agendaTasks}
                completedOpen={completedOpen}
                onCompletedToggle={() => setCompletedOpen((value) => !value)}
                onSelectTask={state.setSelectedTaskId}
                onRunNow={state.runTaskNow}
                onChangeStatus={state.changeStatus}
              />
            </Box>
          </div>
        ) : null}
      </Stack>

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

function QuickCaptureCard({
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
  const [agentId, setAgentId] = useState(agents[0]?.id ?? '')
  const [templateId, setTemplateId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const selectedTemplate = templates.find((template) => template.id === templateId)

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)]">
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-950">Quick capture</div>
        <div className="mt-1 text-sm text-slate-500">Fast path for one-time work. Open the full modal only when the task needs more shape.</div>
      </div>

      <div className="space-y-4">
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
                {agent.name} — {agent.role}
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add to agenda
        </button>
      </div>
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

function AgendaPanel({
  tasks,
  completedOpen,
  onCompletedToggle,
  onSelectTask,
  onRunNow,
  onChangeStatus,
}: {
  tasks: Task[]
  completedOpen: boolean
  onCompletedToggle: () => void
  onSelectTask: (taskId: string) => void
  onRunNow: (taskId: string) => void
  onChangeStatus: (taskId: string, status: 'pending' | 'done' | 'cancelled') => void
}) {
  const grouped = AGENDA_BUCKETS.map((bucket) => ({
    bucket,
    tasks: tasks.filter((task) => task.agendaBucket === bucket),
  }))

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)]">
      <div className="border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={CircleSlash2} label="Overdue" value={grouped.find((entry) => entry.bucket === 'overdue')?.tasks.length ?? 0} />
          <Metric icon={ListChecks} label="Today" value={grouped.find((entry) => entry.bucket === 'today')?.tasks.length ?? 0} />
          <Metric icon={CheckCircle2} label="Completed" value={grouped.find((entry) => entry.bucket === 'completed')?.tasks.length ?? 0} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-6">
          {grouped.map((group) => {
            if (group.bucket === 'completed' && !completedOpen) {
              return (
                <AgendaGroupHeader
                  key={group.bucket}
                  bucket={group.bucket}
                  count={group.tasks.length}
                  onToggle={onCompletedToggle}
                  toggleLabel="Show completed"
                />
              )
            }

            return (
              <section key={group.bucket}>
                <AgendaGroupHeader
                  bucket={group.bucket}
                  count={group.tasks.length}
                  onToggle={group.bucket === 'completed' ? onCompletedToggle : undefined}
                  toggleLabel={group.bucket === 'completed' ? 'Hide completed' : undefined}
                />
                <div className="mt-3 space-y-3">
                  {group.tasks.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-400">
                      No {agendaBucketLabels[group.bucket].toLowerCase()} items.
                    </div>
                  ) : (
                    group.tasks.map((task) => (
                      <AgendaRow
                        key={task.id}
                        task={task}
                        onSelect={() => onSelectTask(task.id)}
                        onRunNow={() => onRunNow(task.id)}
                        onMarkDone={() => onChangeStatus(task.id, 'done')}
                        onCancel={() => onChangeStatus(task.id, 'cancelled')}
                      />
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleSlash2
  label: string
  value: number
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-3 inline-flex rounded-full bg-white p-2 text-slate-500 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )
}

function AgendaGroupHeader({
  bucket,
  count,
  onToggle,
  toggleLabel,
}: {
  bucket: AgendaBucket
  count: number
  onToggle?: () => void
  toggleLabel?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{agendaBucketLabels[bucket]}</div>
        <div className="text-xs text-slate-400">{count} item{count === 1 ? '' : 's'}</div>
      </div>
      {onToggle && toggleLabel ? (
        <button onClick={onToggle} className="text-sm font-medium text-amber-700 transition hover:text-amber-800">
          {toggleLabel}
        </button>
      ) : null}
    </div>
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
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.5)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <button onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
              {task.agendaState ? agendaStateLabels[task.agendaState] : 'Queued'}
            </span>
            {task.agendaBucket ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                {agendaBucketLabels[task.agendaBucket]}
              </span>
            ) : null}
          </div>
          <div className="text-sm font-semibold text-slate-950">{task.title}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{task.agentName}</span>
            <span>{formatDueLabel(task)}</span>
            {task.lastRunError ? <span className="text-red-600">{task.lastRunError}</span> : null}
          </div>
        </button>

        <div className="flex flex-wrap gap-2">
          {task.agendaState !== 'done' ? (
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

function TaskOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-8">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-[92dvh] w-full overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl md:h-full md:max-h-[88vh] md:max-w-5xl md:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 hidden rounded-full bg-white/90 p-2 text-slate-500 shadow-sm transition hover:text-slate-900 md:flex"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}
