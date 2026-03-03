# Tasks

The Tasks section is a kanban-style dispatch board for sending work to agents and monitoring execution. It supports one-time and recurring tasks, templates, and per-agent pre-instructions.

## Views

- **Board:** Kanban board with toggle between "By Agent" (one column per agent) and "By Status" (Pending / Running / Done / Failed)
- **Task Detail:** Full task detail with left sidebar (metadata, danger actions) + right content (instructions, changelog, execution log)
- **Templates:** CRUD interface for reusable task blueprints (split-panel: list left, form right)

## Components

- `Tasks` — Top-level orchestrator (tab bar, board, modals)
- `TaskBoard` — Kanban board with both view modes, mobile column tabs
- `TaskCard` — Individual task card (title, agent badge, status dot, schedule label)
- `TaskDetail` — Full detail view with sidebar + execution log
- `CreateTaskModal` — Task creation form with schedule picker and template browser
- `TemplatesList` — Templates CRUD (list + edit panel)

## Props

```tsx
interface TasksProps {
  tasks: Task[]
  templates: TaskTemplate[]
  preInstructions: AgentPreInstructions[]
  agents: AgentRef[]
  kanbanView: KanbanView
  selectedTaskId?: string | null
  onKanbanViewChange?: (view: KanbanView) => void
  onSelectTask?: (taskId: string) => void
  onCloseTask?: () => void
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'changelog' | 'executionLog' | 'completedAt'>) => void
  onEditTask?: (taskId: string, changes: Partial<Task>) => void
  onDeleteTask?: (taskId: string) => void
  onRunNow?: (taskId: string) => void
  onChangeStatus?: (taskId: string, status: TaskStatus) => void
  onReassignTask?: (taskId: string, agentId: string) => void
  onSavePreInstructions?: (agentId: string, instructions: string) => void
  onCreateTemplate?: (template: Omit<TaskTemplate, 'id'>) => void
  onUpdateTemplate?: (templateId: string, changes: Partial<Omit<TaskTemplate, 'id'>>) => void
  onDeleteTemplate?: (templateId: string) => void
}
```

## Design Notes

- Mobile: column tab strip at top, only one column visible at a time; modals as bottom sheets
- Task detail sidebar: large agent avatar, status dropdown, assign-to dropdown, metadata rows with icons
- Execution log: monospace terminal-style output with a Copy button
- Schedule label: "Daily 9am", "One-time · Mar 5", "Every hour"
