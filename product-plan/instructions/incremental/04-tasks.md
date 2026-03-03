# Milestone 4: Tasks

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1–3 complete

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Implement the Tasks section — a kanban-style task dispatch and scheduling interface with templates and per-agent pre-instructions.

## Overview

The Tasks section is where users dispatch work to agents. It defaults to a "by agent" kanban view (one column per agent) and can be toggled to "by status" (Pending / Running / Done / Failed). Users create one-time or recurring tasks, track execution through a detail view, and manage templates and per-agent pre-instructions.

**Key Functionality:**
- Kanban board with view toggle (By Agent / By Status)
- Task detail modal with execution log and activity changelog
- New task creation form with schedule options (one-time or recurring)
- Templates tab for managing reusable task blueprints
- Per-agent pre-instructions editor (default instructions prepended to all tasks)
- Mobile: column tab strip + single active column; task detail as bottom sheet

## Components Provided

Copy from `product-plan/sections/tasks/components/`:

- `Tasks` — Top-level orchestrator with tab bar, board, modals
- `TaskBoard` — Kanban board with both view modes and mobile tabs
- `TaskCard` — Individual task card (title, agent, status dot, schedule)
- `TaskDetail` — Full task detail with left sidebar + right content + execution log
- `CreateTaskModal` — Task creation form with schedule picker and template browser
- `TemplatesList` — Templates CRUD view (list + edit panel)

## Props Reference

```typescript
interface TasksProps {
  tasks: Task[]
  templates: TaskTemplate[]
  preInstructions: AgentPreInstructions[]
  agents: AgentRef[]
  kanbanView: KanbanView           // 'by_agent' | 'by_status'
  selectedTaskId?: string | null
  onKanbanViewChange?: (view: KanbanView) => void
  onSelectTask?: (taskId: string) => void
  onCloseTask?: () => void
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'changelog' | 'executionLog' | 'completedAt'>) => void
  onEditTask?: (taskId: string, changes: Partial<...>) => void
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

## Expected User Flows

### Flow 1: View the Kanban Board

1. User navigates to Tasks — board loads in "By Agent" view
2. User sees one kanban column per agent with task cards
3. User toggles to "By Status" to see Pending / Running / Done / Failed columns
4. **Outcome:** User understands which tasks are in flight per agent

### Flow 2: Create a New Task

1. User clicks "New Task" button
2. Create task modal opens (bottom sheet on mobile)
3. User fills in: title, assigns agent, sets schedule (one-time or recurring)
4. Optionally: user clicks "Templates" to browse and apply a template
5. User clicks "Create Task"
6. **Outcome:** `onCreateTask` is called; task appears in the correct column

### Flow 3: View Task Detail

1. User clicks a task card
2. Task detail opens as a modal (desktop: centered; mobile: bottom sheet)
3. Left sidebar: agent avatar, status dropdown, metadata, danger actions
4. Right content: title, instructions, activity changelog, execution log
5. User clicks "Run now" to trigger immediate execution
6. **Outcome:** `onRunNow` is called; task status updates

### Flow 4: Manage Templates

1. User clicks "Templates" tab at the top
2. Templates list shows on the left; form panel on the right
3. User creates a new template: name, description, suggested agent, default instructions
4. User can edit or delete existing templates
5. **Outcome:** Template CRUD callbacks fire; template available next time creating a task

### Flow 5: Set Pre-instructions

1. User is in the "By Agent" kanban view
2. User clicks the settings gear icon on an agent column header
3. Pre-instructions modal opens with a textarea
4. User types default instructions to prepend to all of this agent's tasks
5. User clicks "Save"
6. **Outcome:** `onSavePreInstructions` is called with agentId and instructions text

## Empty States

- **No tasks:** Each empty column should show "No tasks" with a dashed border empty state
- **No templates:** Templates tab shows an empty state with "Create your first template" CTA
- **No execution log:** The execution log section should not render if `task.executionLog` is null

## Testing

See `product-plan/sections/tasks/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/tasks/README.md` — Feature overview
- `product-plan/sections/tasks/tests.md` — UI behavior test specs
- `product-plan/sections/tasks/components/` — React components
- `product-plan/sections/tasks/types.ts` — TypeScript interfaces
- `product-plan/sections/tasks/sample-data.json` — Test data

## Done When

- [ ] Kanban board renders in both "By Agent" and "By Status" views
- [ ] Task cards show agent, status, and schedule
- [ ] Task detail modal opens on card click, closes on backdrop or X
- [ ] "Run now" and status change callbacks fire correctly
- [ ] Create task form: both one-time and recurring schedule options work
- [ ] Template picker in create form applies template to form fields
- [ ] Templates tab: create, edit, and delete templates
- [ ] Pre-instructions editor opens, saves, and closes
- [ ] Mobile: column tab strip, single active column, bottom sheets
- [ ] Responsive on all screen sizes
