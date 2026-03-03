# Agents — UI Behavior Tests

## Agent List View

- [ ] Card grid renders all agents
- [ ] Grid is 4 columns on desktop, 2 on tablet, 1 on mobile
- [ ] Each card shows: robohash avatar, name, role, status dot, model badge
- [ ] Status dot: grey = idle, pulsing amber = busy, red = error
- [ ] Clicking a card fires `onSelectAgent(agentId)`
- [ ] "Sync from OpenClaw" button is visible in the header
- [ ] While syncing (`isSyncing=true`): button shows spinner and is disabled
- [ ] After sync completes: button returns to normal state
- [ ] Clicking sync button fires `onSync()`
- [ ] Empty state ("No agents found") shown when `agents` array is empty
- [ ] Empty state includes a "Sync from OpenClaw" CTA button

## Agent Detail View

- [ ] Back button fires `onBack()`
- [ ] Header shows large robohash avatar, name, role, current status
- [ ] Stat tiles show: total tasks run, skills count, current model
- [ ] Recent tasks panel shows the agent's last N tasks
- [ ] Each task row shows: task name, status badge, relative timestamp
- [ ] "View all tasks" link fires `onViewTasks(agentId)`
- [ ] Skills panel shows all bound skills with name and category
- [ ] "No recent tasks" shown when task history is empty
- [ ] "No skills configured" shown when skills array is empty

## Model Selector

- [ ] Current model name displayed in a selector/dropdown
- [ ] Clicking the selector opens a dropdown of available models
- [ ] Each model shows: name and model ID in small text
- [ ] Selecting a model fires `onChangeModel(agentId, modelId)`
- [ ] Selected model highlighted in the dropdown

## Config Doc Viewer

- [ ] Left panel lists all config file names (AGENTS.md, SOUL.md, TOOLS.md, etc.)
- [ ] First file is selected and its content shown on page load
- [ ] Clicking a filename highlights it and loads its content on the right
- [ ] Content renders as styled markdown (headings, lists, code blocks)
- [ ] Config section handles gracefully when no docs are present

## Layout & Responsiveness

- [ ] List view: card grid collapses from 4 → 2 → 1 columns
- [ ] Detail view: two-column grid for tasks/skills panels stacks on mobile
- [ ] Config viewer: left file list and right content stack on narrow screens
