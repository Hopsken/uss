'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
import { TemplatesList } from './TemplatesList'
import { automationLabels, automationTone, formatShortDate } from './presentation'
import type { AutomationStatus, AutomationView, Task } from './types'
import { useTasksDashboard } from './useTasksDashboard'

const STORAGE_KEY = 'uss.automation.view'
const AUTOMATION_LANES: Array<{
  key: 'healthy' | 'running' | 'attention' | 'paused'
  members: AutomationStatus[]
}> = [
  { key: 'healthy', members: ['healthy'] },
  { key: 'running', members: ['running'] },
  { key: 'attention', members: ['attention', 'due_soon'] },
  { key: 'paused', members: ['paused'] },
]

function readStoredView(): AutomationView {
  if (typeof window === 'undefined') return 'by_status'
  return window.localStorage.getItem(STORAGE_KEY) === 'by_agent' ? 'by_agent' : 'by_status'
}

function matchesSearch(task: Task, query: string): boolean {
  if (!query) return true
  const normalized = query.trim().toLowerCase()
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.agentName.toLowerCase().includes(normalized) ||
    task.schedule.humanReadable.toLowerCase().includes(normalized)
  )
}

export function AutomationClient({ initialAgentFilter }: { initialAgentFilter: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [automationView, setAutomationView] = useState<AutomationView>('by_status')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [search, setSearch] = useState('')
  const state = useTasksDashboard(initialAgentFilter)

  useEffect(() => {
    setAutomationView(readStoredView())
  }, [])

  const selectedTask = useMemo(
    () => state.recurringTasks.find((task) => task.id === state.selectedTaskId) ?? null,
    [state.recurringTasks, state.selectedTaskId],
  )

  const filteredTasks = useMemo(
    () => state.recurringTasks.filter((task) => matchesSearch(task, search)),
    [search, state.recurringTasks],
  )

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1480} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <div className="px-1">
          <h1 className="text-[2rem] font-semibold tracking-tight text-slate-950" style={{ fontFamily: 'var(--font-heading)' }}>
            Automation
          </h1>
        </div>

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

        {state.dashboardQuery.data ? (
          <Box
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]"
            style={{ opacity: state.busy ? 0.82 : 1 }}
          >
            <TasksToolbar
              primary={
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <ToolbarSearch value={search} onChange={setSearch} placeholder="Search automations or agents" />
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
                  <div className="rounded-full border border-slate-200 bg-slate-100/80 p-1">
                    {(['by_status', 'by_agent'] as AutomationView[]).map((view) => (
                      <button
                        key={view}
                        onClick={() => {
                          setAutomationView(view)
                          if (typeof window !== 'undefined') {
                            window.localStorage.setItem(STORAGE_KEY, view)
                          }
                        }}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                          view === automationView ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {view === 'by_status' ? 'By status' : 'By agent'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setTemplatesOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    Templates
                  </button>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    New automation
                  </button>
                </div>
              }
            />

            <AutomationPanel
              tasks={filteredTasks}
              agents={state.agents}
              automationView={automationView}
              onSelectTask={state.setSelectedTaskId}
              search={search}
            />
          </Box>
        ) : null}
      </Stack>

      <UtilityPanel
        open={templatesOpen}
        title="Automation templates"
        description="Reusable task patterns stay nearby, but off the main board."
        size="wide"
        onClose={() => setTemplatesOpen(false)}
      >
        <TemplatesList
          templates={state.templates}
          agents={state.agents}
          onCreate={state.createTemplate}
          onUpdate={state.updateTemplate}
          onDelete={state.deleteTemplate}
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

function AutomationPanel({
  tasks,
  agents,
  automationView,
  onSelectTask,
  search,
}: {
  tasks: Task[]
  agents: { id: string; name: string; role: string }[]
  automationView: AutomationView
  onSelectTask: (taskId: string) => void
  search: string
}) {
  const statusGroups = AUTOMATION_LANES.map((lane) => ({
    key: lane.key,
    label: automationLabels[lane.key],
    tasks: tasks.filter((task) => task.automationStatus && lane.members.includes(task.automationStatus)),
  }))

  const agentGroups = agents
    .map((agent) => ({
      agent,
      tasks: tasks.filter((task) => task.agentId === agent.id),
    }))
    .filter((group) => group.tasks.length > 0)

  const isEmpty = tasks.length === 0

  return (
    <div className="min-h-0 flex-1 px-4 py-4 md:px-5">
      {isEmpty ? (
        <EmptySurfaceState
          title={search ? 'No matching automations' : 'No automations yet'}
          description={
            search
              ? 'Try a different search term or clear filters to bring tasks back into view.'
              : 'Create a recurring task or open templates to seed a few repeatable jobs.'
          }
        />
      ) : (
        <div className="flex h-full min-h-0 gap-4 overflow-x-auto overflow-y-hidden pb-2">
          {automationView === 'by_status'
            ? statusGroups.map((group) => (
                <AutomationColumn
                  key={group.key}
                  label={group.label}
                  status={group.key}
                  tasks={group.tasks}
                  onSelectTask={onSelectTask}
                />
              ))
            : agentGroups.map((group) => (
                <AutomationAgentColumn
                  key={group.agent.id}
                  agent={group.agent}
                  tasks={group.tasks}
                  onSelectTask={onSelectTask}
                />
              ))}
        </div>
      )}
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
    <section className="flex w-[292px] shrink-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${automationTone[status]}`}>{label}</span>
          <span className="text-xs font-medium text-slate-400">{tasks.length}</span>
        </div>
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto p-3">
        {tasks.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
            No {label.toLowerCase()} automations
          </div>
        ) : null}
        {tasks.map((task) => (
          <AutomationCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}
      </div>
    </section>
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
    <section className="flex w-[292px] shrink-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
        <div className="mt-1 text-xs text-slate-500">{agent.role}</div>
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto p-3">
        {tasks.map((task) => (
          <AutomationCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}
      </div>
    </section>
  )
}

function AutomationCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const tone = task.automationStatus ? automationTone[task.automationStatus] : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <button
      onClick={onClick}
      className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:shadow-[0_20px_34px_-28px_rgba(15,23,42,0.55)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-950">{task.title}</div>
          <div className="mt-1 text-xs text-slate-500">{task.agentName}</div>
        </div>
        {task.automationStatus ? (
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
            {automationLabels[task.automationStatus]}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 text-xs text-slate-500">
        <div className="flex items-center justify-between gap-3">
          <span className="uppercase tracking-[0.18em] text-slate-400">Cadence</span>
          <span className="truncate font-medium text-slate-700">{task.schedule.humanReadable}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="uppercase tracking-[0.18em] text-slate-400">Next run</span>
          <span className="font-medium text-slate-700">{formatShortDate(task.nextRunAt)}</span>
        </div>
        <div className="rounded-[18px] bg-slate-50 px-3 py-2 text-left">
          <div className="mb-1 uppercase tracking-[0.18em] text-slate-400">Signal</div>
          <div className={`line-clamp-2 font-medium ${task.lastRunError ? 'text-red-600' : 'text-slate-700'}`}>
            {task.lastRunError ?? `Last run: ${task.lastRunStatus}`}
          </div>
        </div>
      </div>
    </button>
  )
}
