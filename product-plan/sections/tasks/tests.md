# Tasks — UI Behavior Tests

## Kanban Board — By Agent View

- [ ] Default view is "By Agent" (one column per agent)
- [ ] Each column header shows agent robohash avatar and name
- [ ] Column header has a settings gear icon to open pre-instructions
- [ ] Task cards render in each agent's column
- [ ] Empty columns show a dashed-border empty state with "No tasks"
- [ ] Tasks appear in the correct agent's column based on `task.agentId`

## Kanban Board — By Status View

- [ ] Toggling to "By Status" shows Pending / Running / Done / Failed columns
- [ ] Each column header shows the status label and task count
- [ ] Tasks appear in the correct status column
- [ ] `onKanbanViewChange` fires when toggle is clicked

## Task Cards

- [ ] Card shows: title, agent avatar + name, status badge, schedule label
- [ ] Status badge colors: pending (slate), running (pulsing amber), done (emerald), failed (red)
- [ ] Schedule label: "One-time · Mar 5", "Daily 9am", "Every hour"
- [ ] Clicking a card fires `onSelectTask(taskId)`

## Task Detail Modal

- [ ] Modal opens when a task is selected
- [ ] Desktop: centered modal; Mobile: bottom sheet sliding up from bottom
- [ ] Left sidebar shows: large agent avatar, agent name + role, status dropdown, assigned-to dropdown
- [ ] Status dropdown color-coded to match status
- [ ] Changing status fires `onChangeStatus(taskId, newStatus)`
- [ ] Changing assigned agent fires `onReassignTask(taskId, agentId)`
- [ ] Metadata rows show: Scheduled For, Created At, Completed At (if applicable) with icons
- [ ] Right content shows: task title, schedule label, instructions in a card
- [ ] Activity changelog renders entries with colored dot icons, event name, detail text, timestamp
- [ ] Execution log section is collapsible; not shown when `executionLog` is null
- [ ] Execution log uses monospace font with a "Copy" button
- [ ] "Run now" button fires `onRunNow(taskId)`
- [ ] Archive and Delete links at the bottom of the left sidebar
- [ ] Clicking Delete fires `onDeleteTask(taskId)`
- [ ] Closing modal (X button or backdrop) fires `onCloseTask()`

## Create Task Modal

- [ ] "New Task" button opens the create modal
- [ ] Modal shows: title input, instructions textarea, agent dropdown, schedule type selector
- [ ] Agent dropdown shows agent names with robohash avatars
- [ ] Schedule type "One-time": shows date/time picker
- [ ] Schedule type "Recurring": shows preset dropdown (daily, hourly, weekly) + optional cron input
- [ ] "Create Task" button disabled when title is empty
- [ ] Submitting fires `onCreateTask(...)` with all form values
- [ ] Template picker: clicking "Templates" shows browsable template list
- [ ] Applying a template pre-fills title, instructions, and suggested agent

## Templates

- [ ] Templates tab renders the `TemplatesList` component
- [ ] Left panel lists all templates with name, description snippet, suggested agent
- [ ] "New" button opens the create form in the right panel
- [ ] Clicking a template row opens it in the edit form
- [ ] Form fields: name (required), description, suggested agent (optional), default instructions
- [ ] Save disabled when name is empty
- [ ] Creating fires `onCreateTemplate(...)`
- [ ] Updating fires `onUpdateTemplate(id, changes)`
- [ ] Deleting shows a confirmation dialog before firing `onDeleteTemplate(id)`
- [ ] Empty state shown when no templates exist

## Pre-instructions Editor

- [ ] Gear icon on an agent column header opens the pre-instructions modal
- [ ] Modal title shows agent name
- [ ] Textarea pre-filled with existing pre-instructions for that agent
- [ ] Saving fires `onSavePreInstructions(agentId, text)`
- [ ] Closing without saving discards changes

## Mobile

- [ ] Column tab strip at top shows one tab per agent (or one per status)
- [ ] Only the active column is visible at a time
- [ ] Scrolling tabs when there are many agents/columns
- [ ] Task detail opens as a bottom sheet
- [ ] Create task modal opens as a bottom sheet
