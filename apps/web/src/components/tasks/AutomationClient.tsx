'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { BellRing, Bot, Clock3, Layers3, Plus, Sparkles, X } from 'lucide-react'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskDetail } from './TaskDetail'
import { TemplatesList } from './TemplatesList'
import { automationLabels, automationTone, countAutomation, formatShortDate } from './presentation'
import type { AutomationStatus, AutomationView, Task } from './types'
import { useTasksDashboard } from './useTasksDashboard'

const STORAGE_KEY = 'uss.automation.view'
const AUTOMATION_STATUSES: AutomationStatus[] = ['attention', 'running', 'due_soon', 'healthy', 'paused']

function readStoredView(): AutomationView {
  if (typeof window === 'undefined') return 'by_status'
  return window.localStorage.getItem(STORAGE_KEY) === 'by_agent' ? 'by_agent' : 'by_status'
}

export function AutomationClient({ initialAgentFilter }: { initialAgentFilter: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [section, setSection] = useState<'automation' | 'templates'>('automation')
  const [automationView, setAutomationView] = useState<AutomationView>('by_status')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const state = useTasksDashboard(initialAgentFilter)

  useEffect(() => {
    setAutomationView(readStoredView())
  }, [])

  const selectedTask = useMemo(
    () => state.recurringTasks.find((task) => task.id === state.selectedTaskId) ?? null,
    [state.recurringTasks, state.selectedTaskId],
  )

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1400} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)] px-6 py-6">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_92%,rgba(15,23,42,0.06)_92%,rgba(15,23,42,0.06)_100%)] bg-[length:100%_18px] opacity-30" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                Automation
              </div>
              <Title order={1} ff="var(--font-heading)">
                Recurring task ops, not a generic task board
              </Title>
              <Text c="dimmed" maw={720} mt="xs">
                Monitor schedule health, catch failed automations early, and drill into runs before they become quiet breakage.
              </Text>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SectionButton active={section === 'automation'} onClick={() => setSection('automation')}>
                Automations
              </SectionButton>
              <SectionButton active={section === 'templates'} onClick={() => setSection('templates')}>
                Templates
              </SectionButton>
              {section === 'automation' ? (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  New automation
                </button>
              ) : null}
            </div>
          </div>
        </Box>

        {state.dashboardQuery.isPending && !state.dashboardQuery.data ? (
          <Center py="xl">
            <Loader color="sky" />
          </Center>
        ) : null}

        {state.dashboardQuery.error && !state.dashboardQuery.data ? (
          <Alert color="red" title="Unable to load automation">
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
              <Text size="sm">Showing automations assigned to {state.agentFilter}.</Text>
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
          <Box
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
            style={{ minHeight: 0, flex: 1, opacity: state.busy ? 0.84 : 1 }}
          >
            {section === 'templates' ? (
              <TemplatesList
                templates={state.templates}
                agents={state.agents}
                onCreate={state.createTemplate}
                onUpdate={state.updateTemplate}
                onDelete={state.deleteTemplate}
              />
            ) : (
              <AutomationPanel
                tasks={state.recurringTasks}
                agents={state.agents}
                automationView={automationView}
                onAutomationViewChange={(view) => {
                  setAutomationView(view)
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STORAGE_KEY, view)
                  }
                }}
                onCreateTask={() => setCreateModalOpen(true)}
                onSelectTask={state.setSelectedTaskId}
              />
            )}
          </Box>
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
          defaultTaskType="recurring"
          title="New Automation"
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

function SectionButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function AutomationPanel({
  tasks,
  agents,
  automationView,
  onAutomationViewChange,
  onCreateTask,
  onSelectTask,
}: {
  tasks: Task[]
  agents: { id: string; name: string; role: string }[]
  automationView: AutomationView
  onAutomationViewChange: (view: AutomationView) => void
  onCreateTask: () => void
  onSelectTask: (taskId: string) => void
}) {
  const statusGroups = AUTOMATION_STATUSES.map((status) => ({
    key: status,
    label: automationLabels[status],
    tasks: tasks.filter((task) => task.automationStatus === status),
  }))

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile icon={BellRing} label="Attention" value={countAutomation(tasks, 'attention')} />
            <SummaryTile icon={Bot} label="Running now" value={countAutomation(tasks, 'running')} />
            <SummaryTile icon={Clock3} label="Due soon" value={countAutomation(tasks, 'due_soon')} />
            <SummaryTile icon={Layers3} label="Healthy" value={countAutomation(tasks, 'healthy')} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-slate-100 p-1">
              {(['by_status', 'by_agent'] as AutomationView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => onAutomationViewChange(view)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    view === automationView ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {view === 'by_status' ? 'By status' : 'By agent'}
                </button>
              ))}
            </div>
            <button
              onClick={onCreateTask}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add automation
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        <div className="flex min-h-full gap-4">
          {automationView === 'by_status'
            ? statusGroups.map((group) => (
                <AutomationColumn key={group.key} label={group.label} status={group.key} tasks={group.tasks} onSelectTask={onSelectTask} />
              ))
            : agents.map((agent) => (
                <AutomationAgentColumn
                  key={agent.id}
                  agent={agent}
                  tasks={tasks.filter((task) => task.agentId === agent.id)}
                  onSelectTask={onSelectTask}
                />
              ))}
        </div>
      </div>
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BellRing
  label: string
  value: number
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
      <div className="mb-3 inline-flex rounded-full bg-slate-100 p-2 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )
}

function AutomationColumn({
  label,
  status,
  tasks,
  onSelectTask,
}: {
  label: string
  status: AutomationStatus
  tasks: Task[]
  onSelectTask: (taskId: string) => void
}) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col rounded-[26px] border border-slate-200 bg-white/75 p-3">
      <div className="mb-3 flex items-center justify-between px-2 pt-1">
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${automationTone[status]}`}>{label}</div>
        <div className="text-xs font-medium text-slate-400">{tasks.length}</div>
      </div>
      <div className="flex min-h-[160px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? <EmptyColumn label={`No ${label.toLowerCase()} automations`} /> : null}
        {tasks.map((task) => (
          <AutomationCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}
      </div>
    </div>
  )
}

function AutomationAgentColumn({
  agent,
  tasks,
  onSelectTask,
}: {
  agent: { id: string; name: string; role: string }
  tasks: Task[]
  onSelectTask: (taskId: string) => void
}) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col rounded-[26px] border border-slate-200 bg-white/75 p-3">
      <div className="mb-3 rounded-[20px] bg-slate-950 px-4 py-3 text-white">
        <div className="text-sm font-semibold">{agent.name}</div>
        <div className="text-xs text-slate-300">{agent.role}</div>
      </div>
      <div className="flex min-h-[160px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? <EmptyColumn label="No automations for this agent" /> : null}
        {tasks.map((task) => (
          <AutomationCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}
      </div>
    </div>
  )
}

function AutomationCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const tone = task.automationStatus ? automationTone[task.automationStatus] : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <button
      onClick={onClick}
      className="rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_32px_-24px_rgba(15,23,42,0.45)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">{task.title}</div>
          <div className="mt-1 text-xs text-slate-500">{task.agentName}</div>
        </div>
        {task.automationStatus ? (
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
            {automationLabels[task.automationStatus]}
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
        <div>
          <div className="mb-1 uppercase tracking-[0.18em] text-slate-400">Cadence</div>
          <div className="font-medium text-slate-700">{task.schedule.humanReadable}</div>
        </div>
        <div>
          <div className="mb-1 uppercase tracking-[0.18em] text-slate-400">Next run</div>
          <div className="font-medium text-slate-700">{formatShortDate(task.nextRunAt)}</div>
        </div>
        <div>
          <div className="mb-1 uppercase tracking-[0.18em] text-slate-400">Last run</div>
          <div className="font-medium text-slate-700">{task.lastRunStatus}</div>
        </div>
        <div>
          <div className="mb-1 uppercase tracking-[0.18em] text-slate-400">Signal</div>
          <div className="line-clamp-2 font-medium text-slate-700">{task.lastRunError ?? 'No active issues'}</div>
        </div>
      </div>
    </button>
  )
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-400">
      {label}
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
