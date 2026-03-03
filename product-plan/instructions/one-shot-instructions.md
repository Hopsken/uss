# One-Shot Implementation Instructions

> This document combines all milestones into a single implementation guide.
> **Provide alongside:** `product-overview.md`

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

## Milestone 1: Shell

### Goal

Set up design tokens and the application shell — the persistent navigation and layout that wraps all sections.

### 1. Design Tokens

Configure your styling system:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for color usage patterns
- See `product-plan/design-system/fonts.md` for Google Fonts setup

Key settings:
- **Primary:** `sky` (buttons, active nav, links)
- **Secondary:** `amber` (warnings, busy status)
- **Neutral:** `slate` (backgrounds, borders, text)
- **Fonts:** Space Grotesk (headings/labels), Inter (body), JetBrains Mono (numbers/code)

### 2. Application Shell

Copy shell components from `product-plan/shell/components/`:

- `AppShell.tsx` — Main layout wrapper (flex row: sidebar + content)
- `MainNav.tsx` — Navigation with 3 responsive states
- `index.ts` — Exports

**Wire Up Navigation:**

```tsx
<AppShell
  navigationItems={[
    { label: 'Bridge', href: '/bridge', isActive: currentPath === '/bridge' },
    { label: 'Agents', href: '/agents', isActive: currentPath === '/agents' },
    { label: 'Tasks', href: '/tasks', isActive: currentPath === '/tasks' },
    { label: 'Activity', href: '/activity', isActive: currentPath === '/activity' },
    { label: 'Usage', href: '/usage', isActive: currentPath === '/usage' },
    { label: 'Skills', href: '/skills', isActive: currentPath === '/skills' },
    { label: 'Settings', href: '/settings', isActive: currentPath === '/settings' },
  ]}
  onNavigate={(href) => router.push(href)}
>
  {children}
</AppShell>
```

**Important:** `label` must match one of the icon map keys (case-insensitive): `bridge`, `agents`, `tasks`, `activity`, `usage`, `skills`, `settings`.

**No User Menu:** USS is a single-user tool with no authentication.

### 3. Responsive Behavior

- **Desktop (lg+):** Full 224px sidebar with labels
- **Tablet (md–lg):** 56px icon-only sidebar
- **Mobile:** Fixed 56px top header + hamburger → full-width dropdown nav

Content area gets `pt-14 md:pt-0` for the mobile top bar.

### Shell Done When

- [ ] Design tokens configured (fonts loaded, color classes working)
- [ ] Shell renders with all 7 navigation items
- [ ] Active nav item highlighted in sky blue
- [ ] Navigation triggers routing
- [ ] Full sidebar on desktop, icon-only on tablet, header + hamburger on mobile
- [ ] Settings item isolated at the bottom of the sidebar

---

## Milestone 2: Bridge

### Goal

Implement the Bridge — the command center overview shown when USS first loads.

### Overview

Bridge is a read-only snapshot of the entire system: which agents are active, recent task history, current system health, and a quick usage summary. All items link out to their sections.

### Components

Copy from `product-plan/sections/bridge/components/`:

- `Bridge` — Main dashboard layout
- `AgentCard` — Compact agent card (avatar, name, role, model, status dot)
- `TaskRunRow` — Single task run row with status icon, task name, agent badge, timestamp
- `HealthPanel` — OpenClaw process status + providers + error alerts
- `UsageTile` — Single period usage tile (cost + tokens + conversations)

### Props

```typescript
interface BridgeProps {
  agents: Agent[]
  recentTaskRuns: RecentTaskRun[]
  systemHealth: SystemHealth
  usageSnapshot: UsageSnapshot
  onViewAgents?: () => void
  onViewAgent?: (agentId: string) => void
  onViewTasks?: () => void
  onViewTaskRun?: (taskRunId: string) => void
  onViewUsage?: () => void
}
```

### Expected User Flows

**Flow 1 — Check Fleet Status:** User opens USS → sees agent cards with status dots (grey = idle, pulsing sky = busy, red = error) → understands which agents are active at a glance.

**Flow 2 — Review Recent Tasks:** User scans the last 6–8 task runs → clicks a row → navigates to Tasks.

**Flow 3 — Check System Health:** User reads OpenClaw process status + provider connectivity + recent errors → identifies issues without opening logs.

**Flow 4 — Quick Usage Check:** User glances at Today and This Week cost tiles → clicks a tile → navigates to Usage.

### Empty States

- No agents: show empty state in the strip
- No recent tasks: show "No recent task runs"
- No errors: error section in HealthPanel does not render

### Bridge Done When

- [ ] Agent status strip shows all agents with correct status dots
- [ ] Recent tasks list renders with status icons and timestamps
- [ ] System health shows OpenClaw process + providers + errors
- [ ] Usage tiles show cost and token counts
- [ ] All navigation callbacks wire to correct routes
- [ ] Responsive on mobile

---

## Milestone 3: Agents

### Goal

Implement the Agents section — the full crew roster and per-agent detail view.

### Components

Copy from `product-plan/sections/agents/components/`:

- `AgentsList` — Responsive card grid with header and sync button
- `AgentCard` — Individual agent card
- `AgentDetail` — Full detail page with stats, tasks, skills, model selector, config docs

### Props

```typescript
interface AgentsListProps {
  agents: Agent[]
  isSyncing?: boolean
  onSelectAgent?: (agentId: string) => void
  onSync?: () => void
}

interface AgentDetailProps {
  agent: Agent
  availableModels: AgentModel[]
  onBack?: () => void
  onChangeModel?: (agentId: string, modelId: string) => void
  onViewTasks?: (agentId: string) => void
}
```

### Expected User Flows

**Flow 1 — Browse Roster:** User sees 4-column card grid → identifies busy (pulsing amber) and error (red) agents.

**Flow 2 — Sync Agents:** User clicks "Sync from OpenClaw" → button spins → list refreshes.

**Flow 3 — View Agent Detail:** User clicks a card → sees stats, recent tasks, skills, config docs.

**Flow 4 — Change Model:** User opens agent detail → clicks model selector → selects a different model → `onChangeModel` fires.

**Flow 5 — View Config Docs:** User scrolls to Configuration section → clicks a filename on the left → content renders as styled markdown on the right.

### Empty States

- No agents: empty state with "Sync from OpenClaw" CTA
- No recent tasks: "No recent tasks" in tasks panel
- No skills: "No skills configured" in skills panel

### Agents Done When

- [ ] Agent card grid renders with real data (4 → 2 → 1 columns)
- [ ] Status dots animate correctly (pulsing for busy)
- [ ] Sync button shows loading state and triggers `onSync`
- [ ] Clicking a card navigates to agent detail
- [ ] Agent detail shows all stats, tasks, skills, and config docs
- [ ] Model selector fires `onChangeModel`
- [ ] Config doc viewer: clicking a file shows content as styled markdown
- [ ] Responsive on mobile

---

## Milestone 4: Tasks

### Goal

Implement the Tasks section — a kanban-style task dispatch and scheduling interface.

### Components

Copy from `product-plan/sections/tasks/components/`:

- `Tasks` — Top-level orchestrator
- `TaskBoard` — Kanban board (both view modes, mobile tabs)
- `TaskCard` — Individual task card
- `TaskDetail` — Full detail view with sidebar + execution log
- `CreateTaskModal` — Task creation form with schedule picker and template browser
- `TemplatesList` — Templates CRUD view

### Props

```typescript
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

### Expected User Flows

**Flow 1 — View Board:** Default is "By Agent" view → toggle to "By Status" (Pending / Running / Done / Failed).

**Flow 2 — Create a Task:** "New Task" → fill title, agent, schedule (one-time or recurring) → optionally apply a template → "Create Task".

**Flow 3 — View Task Detail:** Click a card → left sidebar has status/agent dropdowns + metadata; right has instructions + activity changelog + execution log.

**Flow 4 — Manage Templates:** Templates tab → list on left, form on right → create, edit, delete templates.

**Flow 5 — Set Pre-instructions:** Click gear on agent column header → modal with textarea → save prepends to all tasks for that agent.

### Empty States

- Empty columns: dashed-border empty state, "No tasks"
- No templates: empty state with "Create your first template" CTA
- No execution log: section does not render when `task.executionLog` is null

### Tasks Done When

- [ ] Kanban renders in both "By Agent" and "By Status" views
- [ ] Task cards show agent, status, and schedule
- [ ] Task detail opens on card click, closes on backdrop or X
- [ ] Run now and status change callbacks fire correctly
- [ ] Create form: both one-time and recurring schedule options work
- [ ] Template picker applies template to form fields
- [ ] Templates tab: create, edit, and delete templates
- [ ] Pre-instructions editor opens, saves, and closes
- [ ] Mobile: column tab strip, single active column, bottom sheets

---

## Milestone 5: Activity

### Goal

Implement the Activity section — a chronological feed of all agent actions.

### Components

Copy from `product-plan/sections/activity/components/`:

- `Activity` — Complete activity feed with filters, grouping, and event rows

### Props

```typescript
interface ActivityProps {
  events: ActivityEvent[]
  agents: AgentRef[]
  activeAgentId?: string | null
  activeEventType?: EventType | null
  onFilterByAgent?: (agentId: string | null) => void
  onFilterByType?: (eventType: EventType | null) => void
}

type EventType = 'task_run' | 'skill_invoked' | 'conversation' | 'system'
type EventStatus = 'success' | 'failed' | 'running' | 'info'
```

### Expected User Flows

**Flow 1 — Browse All Activity:** Reverse-chronological feed, grouped by date (Today / Yesterday / date labels). Each event shows status bar, agent, type badge, description, timestamp.

**Flow 2 — Filter by Agent:** Select agent from dropdown → feed narrows → clear with "All agents".

**Flow 3 — Filter by Event Type:** Click a type pill (Task / Skill / Chat / System) → toggle on/off.

**Flow 4 — Combined Filtering:** Both filters active → "Clear" button appears → clears both at once.

**Note:** Filtering is done internally with `useMemo`. Parent only stores the active filter values and passes them as props.

### Empty States

- No events matching filters: empty state with icon and "Clear filters" link

### Activity Done When

- [ ] Feed renders all events in reverse-chronological order
- [ ] Events grouped correctly by date
- [ ] Agent filter dropdown works and clears correctly
- [ ] Event type pills toggle correctly (one active at a time)
- [ ] Combined filters narrow the feed
- [ ] "Clear" button appears only when filters are active
- [ ] Empty state when no events match
- [ ] Responsive on mobile

---

## Milestone 6: Usage

### Goal

Implement the Usage section — a cost and token consumption dashboard.

### Components

Copy from `product-plan/sections/usage/components/`:

- `Usage` — Complete usage dashboard (all panels in one component)

### Props

```typescript
interface UsageProps {
  summary: UsageSummary
  timeSeries: TimeSeriesPoint[]
  agents: AgentUsage[]
  modelBreakdown: ModelUsage[]
  activeTimeRange: TimeRange
  onTimeRangeChange?: (range: TimeRange) => void
}

type TimeRange = 'this_week' | 'this_month' | 'last_month' | 'all_time'
```

### Expected User Flows

**Flow 1 — Check Spend:** Four metric tiles at top; Total Cost highlighted in sky blue.

**Flow 2 — Switch Time Range:** Click a tab pill (This Week / This Month / Last Month / All Time) → `onTimeRangeChange` fires → parent re-fetches data.

**Flow 3 — Read Daily Chart:** Bar chart shows daily cost; hover over a bar → tooltip shows exact cost.

**Flow 4 — Compare Agents:** Horizontal bar chart (top spender in amber, others in sky) + sortable table.

**Flow 5 — Review Model Breakdown:** Model table with model name, ID in monospace, cost, tokens, conversations, tasks.

### Empty States

- No time series data: `SpendChart` does not render
- No agents: "By agent" section shows gracefully empty tables

### Usage Done When

- [ ] Four metric tiles render with correct values
- [ ] Time range selector triggers `onTimeRangeChange`
- [ ] Daily cost chart renders proportionally
- [ ] Chart hover tooltips show cost
- [ ] Agent bar chart and table show all agents
- [ ] Model breakdown table renders
- [ ] JetBrains Mono on all numeric values
- [ ] Responsive: Convos and Tasks columns hide on mobile

---

## Milestone 7: Skills

### Goal

Implement the Skills section — a management interface for browsing, toggling, and configuring OpenClaw skills.

### Components

Copy from `product-plan/sections/skills/components/`:

- `Skills` — Complete skills manager (list + desktop panel + mobile bottom sheet)

### Props

```typescript
interface SkillsProps {
  systemSkills: Skill[]
  agentGroups: AgentSkillGroup[]
  selectedSkillId?: string | null
  selectedAgentId?: string | null
  onToggleSkill?: (skillId: string, agentId: string | null, enabled: boolean) => void
  onSelectSkill?: (skillId: string, agentId: string | null) => void
  onClosePanel?: () => void
  onSaveConfig?: (skillId: string, agentId: string | null, config: SkillConfig[]) => void
  onAssignSkill?: (skillId: string, targetAgentId: string) => void
}
```

### Expected User Flows

**Flow 1 — Browse Skills:** System group first, then one group per agent. Each group collapsible. Each row shows category badge, name, description, config status, last used, toggle.

**Flow 2 — Search:** Real-time filtering by name/description/category. Groups with no matches disappear.

**Flow 3 — Toggle:** Click toggle switch → fires `onToggleSkill(skillId, agentId, enabled)` → does not open the config panel.

**Flow 4 — Configure (Desktop):** Click skill row → left-border accent + right-side config panel opens. Edit fields → "Save changes" button activates → fires `onSaveConfig`.

**Flow 5 — Configure (Mobile):** Tap skill row → bottom sheet (88dvh) slides up. Same config interactions. Tap backdrop or X to close.

**Flow 6 — View SKILL.md:** Click "SKILL.md" tab in panel → renders skill instructions as styled markdown with frontmatter block.

**Flow 7 — Reassign Skill:** Click a different agent's button in the "Assigned to" section → fires `onAssignSkill(skillId, targetAgentId)`.

### Empty States

- No search results: "No skills match" with "Clear search" link
- Skill with no config fields: Config tab shows description/last-used but no fields or save button
- Skill with no SKILL.md: "SKILL.md" tab is hidden

### Skills Done When

- [ ] Skills list renders all groups and skills
- [ ] Search filters in real-time
- [ ] Needs-setup badge shows count in header
- [ ] Toggle switches fire `onToggleSkill`
- [ ] Selecting a skill: left-border accent + desktop panel opens
- [ ] Mobile bottom sheet: opens on tap, closes on backdrop
- [ ] Config tab: fields editable, save active only when dirty
- [ ] SKILL.md tab: markdown renders with styled frontmatter block
- [ ] Assign-to-agent buttons: active highlighted, clicking fires `onAssignSkill`
- [ ] Responsive on all screen sizes
