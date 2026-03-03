# Bridge

Bridge is the command center overview — the default screen when USS opens. It provides a read-only snapshot of the entire fleet: which agents are active, recent task history, current system health, and a quick usage summary.

## Layout

Single scrollable page divided into four areas:
1. **Agent Status Strip** — Horizontal scrollable row of compact agent cards
2. **Recent Tasks** — Compact list of the last 6–8 task runs across all agents
3. **System Health** — Two columns: OpenClaw process + provider statuses on the left, recent errors/warnings on the right
4. **Usage Snapshot** — Two stat tiles: "Today" and "This Week"

## Components

- `Bridge` — Main dashboard layout, accepts all data props and navigation callbacks
- `AgentCard` — Compact card (robohash avatar, name, role, model pill, status dot)
- `TaskRunRow` — Single task run row (status icon, task name, agent badge, relative time)
- `HealthPanel` — OpenClaw process + provider statuses + error alerts
- `UsageTile` — Single period usage tile (cost + tokens + conversations)

## Props

```tsx
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

## Design Notes

- Status dot colors: grey = idle, pulsing sky = busy, red = error
- All items link out to their sections — no inline editing on this screen
- Status indicators: green (healthy/idle), amber (busy/warning), red (error/down)
- Provider API connectivity shown with latency in milliseconds
