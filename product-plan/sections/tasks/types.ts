export type TaskStatus = 'pending' | 'running' | 'done' | 'failed' | 'cancelled'

export type KanbanView = 'by_agent' | 'by_status'

export type SchedulePreset = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'

export type ChangelogEntryType =
  | 'task_created'
  | 'status_changed'
  | 'agent_assigned'
  | 'task_updated'
  | 'run_triggered'

export interface TaskSchedule {
  type: 'one_time' | 'recurring'
  /** ISO 8601 — for one-time tasks */
  scheduledAt?: string
  preset?: SchedulePreset
  /** Raw cron expression for custom schedules */
  cronExpression?: string
  /** Human-readable label, e.g. "Daily at 9:00 AM" or "Mon 2/23 8am" */
  humanReadable: string
}

export interface ChangelogEntry {
  id: string
  type: ChangelogEntryType
  /** Bold event title, e.g. "Status changed" */
  message: string
  /** Sub-line detail, e.g. "Completed by Vale" */
  detail: string
  occurredAt: string
}

export interface Task {
  id: string
  title: string
  instructions: string
  agentId: string
  agentName: string
  agentRole: string
  status: TaskStatus
  schedule: TaskSchedule
  createdAt: string
  updatedAt: string
  completedAt: string | null
  templateId: string | null
  changelog: ChangelogEntry[]
  /** Raw monospace execution log text, or null if never run */
  executionLog: string | null
}

export interface TaskTemplate {
  id: string
  name: string
  description: string
  defaultInstructions: string
  /** If set, this template is recommended for the given agent */
  suggestedAgentId?: string
}

export interface AgentPreInstructions {
  agentId: string
  agentName: string
  agentRole: string
  instructions: string
  updatedAt: string
}

export interface AgentRef {
  id: string
  name: string
  role: string
}

export interface TasksProps {
  tasks: Task[]
  templates: TaskTemplate[]
  preInstructions: AgentPreInstructions[]
  agents: AgentRef[]
  kanbanView: KanbanView
  /** ID of the currently selected/open task */
  selectedTaskId?: string | null
  /** Called when the user switches between kanban views */
  onKanbanViewChange?: (view: KanbanView) => void
  /** Called when the user opens a task detail */
  onSelectTask?: (taskId: string) => void
  /** Called when the user closes the task detail */
  onCloseTask?: () => void
  /** Called when the user clicks "New Task" */
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'changelog' | 'executionLog' | 'completedAt'>) => void
  /** Called when the user edits and saves a task */
  onEditTask?: (taskId: string, changes: Partial<Pick<Task, 'title' | 'instructions' | 'schedule' | 'agentId' | 'agentName' | 'agentRole'>>) => void
  /** Called when the user cancels or deletes a task */
  onDeleteTask?: (taskId: string) => void
  /** Called when the user triggers "Run now" */
  onRunNow?: (taskId: string) => void
  /** Called when the user manually changes a task's status */
  onChangeStatus?: (taskId: string, status: TaskStatus) => void
  /** Called when the user reassigns a task to a different agent */
  onReassignTask?: (taskId: string, agentId: string) => void
  /** Called when the user saves pre-instructions for an agent */
  onSavePreInstructions?: (agentId: string, instructions: string) => void
  /** Called when the user creates a new template */
  onCreateTemplate?: (template: Omit<TaskTemplate, 'id'>) => void
  /** Called when the user updates an existing template */
  onUpdateTemplate?: (templateId: string, changes: Partial<Omit<TaskTemplate, 'id'>>) => void
  /** Called when the user deletes a template */
  onDeleteTemplate?: (templateId: string) => void
}
