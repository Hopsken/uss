# Activity

The Activity section is a chronological feed of all agent actions across the fleet — task executions, skill invocations, conversations, and system events.

## Layout

- Reverse-chronological feed grouped by date (Today, Yesterday, then date labels)
- Filter bar at top: agent selector dropdown + event type pills (Task, Skill, Chat, System)
- Each event row: colored left-border status bar, agent avatar, agent name, type badge, description, timestamp, status icon

## Components

- `Activity` — Complete activity feed with filters, grouping, and event rows (single self-contained component)

## Props

```tsx
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

## Design Notes

- Filtering is done internally with `useMemo` — parent only stores the active filter values
- Status colors: success (emerald), failed (red), running (pulsing amber), info (slate)
- "Clear" button appears in filter bar when any filter is active
- Empty state shown when no events match current filters
