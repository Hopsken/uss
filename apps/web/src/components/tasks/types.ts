import type {
  AgentRef,
  ChangelogEntryType,
  KanbanView,
  SchedulePreset,
  Task,
  TaskSchedule,
  TaskStatus,
  TaskTemplate,
} from '@uss/shared'

export type { AgentRef, ChangelogEntryType, KanbanView, SchedulePreset, Task, TaskStatus, TaskTemplate, TaskSchedule }

export interface TasksProps {
  tasks: Task[]
  templates: TaskTemplate[]
  agents: AgentRef[]
  kanbanView: KanbanView
  selectedTaskId?: string | null
  onKanbanViewChange?: (view: KanbanView) => void
  onSelectTask?: (taskId: string) => void
  onCloseTask?: () => void
  onCreateTask?: (
    task: Omit<
      Task,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'changelog'
      | 'executionLog'
      | 'completedAt'
      | 'lastRunStatus'
      | 'lastRunAt'
      | 'lastRunError'
    >,
  ) => void
  onDeleteTask?: (taskId: string) => void
  onRunNow?: (taskId: string) => void
  onChangeStatus?: (taskId: string, status: TaskStatus) => void
  onReassignTask?: (taskId: string, agentId: string) => void
  onCreateTemplate?: (template: Omit<TaskTemplate, 'id'>) => void
  onUpdateTemplate?: (templateId: string, changes: Partial<Omit<TaskTemplate, 'id'>>) => void
  onDeleteTemplate?: (templateId: string) => void
}
