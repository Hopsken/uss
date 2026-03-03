# Bridge — UI Behavior Tests

## Agent Status Strip

- [ ] Horizontal scrollable strip renders all agents
- [ ] Each card shows robohash avatar, name, role, model pill, and status dot
- [ ] Status dot is grey for idle agents
- [ ] Status dot is pulsing sky blue for busy agents
- [ ] Status dot is red for agents in error state
- [ ] Clicking an agent card fires `onViewAgent(agentId)`
- [ ] Strip is horizontally scrollable when agents overflow the viewport width
- [ ] "View all agents" link fires `onViewAgents()`
- [ ] Empty state shown when `agents` array is empty

## Recent Tasks

- [ ] List renders the last 6–8 task runs
- [ ] Each row shows: status icon, task name, agent name/avatar, relative timestamp
- [ ] Status icon: checkmark for success, spinner for running, X for failed
- [ ] Relative timestamps: "just now", "3m ago", "2h ago", "Yesterday"
- [ ] Clicking a task row fires `onViewTaskRun(taskRunId)`
- [ ] "View all tasks" link fires `onViewTasks()`
- [ ] Empty state ("No recent task runs") shown when `recentTaskRuns` is empty

## System Health

- [ ] OpenClaw process status shows: Running / Stopped / Error with uptime and version
- [ ] Running process shows green dot, Stopped shows grey, Error shows red
- [ ] Provider list shows each provider with a name, status dot, and latency
- [ ] Provider dots: green = connected, amber = degraded, red = down
- [ ] Error/warning alerts render in the right column (red for errors, amber for warnings)
- [ ] If no errors, the error column section does not render
- [ ] Error rows show level badge, message, and relative timestamp

## Usage Snapshot

- [ ] Two tiles render: "Today" and "This Week"
- [ ] Each tile shows: period label, cost, token count, conversation count
- [ ] Cost formatted with `$` prefix and 2 decimal places
- [ ] Token count formatted with K/M suffix
- [ ] Clicking a tile fires `onViewUsage()`

## Layout & Responsiveness

- [ ] Page is a single scrollable column on all screen sizes
- [ ] Agent strip scrolls horizontally on mobile without wrapping
- [ ] System health columns stack vertically on mobile
- [ ] Two usage tiles display side by side on all screen sizes
