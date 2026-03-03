# Milestone 5: Activity

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1–4 complete

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

Implement the Activity section — a chronological feed of all agent actions across the fleet.

## Overview

Activity gives full visibility into what each agent has been doing — task executions, skill invocations, conversations, and system events. Events are grouped by date and can be filtered by agent and event type.

**Key Functionality:**
- Reverse-chronological feed with newest events at top
- Events grouped by date (Today, Yesterday, then date labels)
- Agent filter dropdown with avatars
- Event type filter pills (Task, Skill, Chat, System) — toggle-able
- Combined agent + type filtering
- Empty state when no events match filters with "Clear" option
- Status indicators: success (emerald), failed (red), running (amber spinning), info (slate)

## Components Provided

Copy from `product-plan/sections/activity/components/`:

- `Activity` — Complete activity feed with filters, grouping, and event rows

## Props Reference

```typescript
interface ActivityProps {
  events: ActivityEvent[]
  agents: AgentRef[]
  activeAgentId?: string | null    // Currently active agent filter
  activeEventType?: EventType | null  // Currently active type filter
  onFilterByAgent?: (agentId: string | null) => void  // null to clear
  onFilterByType?: (eventType: EventType | null) => void  // null to clear
}

type EventType = 'task_run' | 'skill_invoked' | 'conversation' | 'system'
type EventStatus = 'success' | 'failed' | 'running' | 'info'
```

## Expected User Flows

### Flow 1: Browse All Activity

1. User navigates to Activity
2. Feed shows all events in reverse-chronological order
3. Events are grouped by date (Today / Yesterday / Mon, Feb 23)
4. Each event shows: status bar (colored left edge), agent avatar, agent name, type badge, description, time, status icon
5. **Outcome:** User sees what every agent has been doing

### Flow 2: Filter by Agent

1. User clicks the "All agents" dropdown in the filter bar
2. Dropdown shows all agents with avatars
3. User selects a specific agent
4. Feed updates to show only that agent's events
5. User clicks the agent filter again → selects "All agents" to clear
6. **Outcome:** `onFilterByAgent` is called with agentId or null

### Flow 3: Filter by Event Type

1. User clicks a type pill (Task, Skill, Chat, or System)
2. Pill highlights; feed filters to show only that event type
3. User clicks the same pill again to deactivate
4. **Outcome:** `onFilterByType` is called with the type or null (toggle)

### Flow 4: Combined Filtering

1. User sets an agent filter AND a type filter
2. Feed shows only events matching both criteria
3. A "Clear" button appears in the filter bar
4. User clicks "Clear" to reset both filters at once
5. **Outcome:** Both `onFilterByAgent(null)` and `onFilterByType(null)` are called

## Empty States

- **No events at all:** Show terminal icon, "No events found", "Try adjusting the filters above"
- **No events for current filters:** Same empty state — the filtering is done in the component internally using `useMemo`

## Testing

See `product-plan/sections/activity/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/activity/README.md` — Feature overview
- `product-plan/sections/activity/tests.md` — UI behavior test specs
- `product-plan/sections/activity/components/` — React components
- `product-plan/sections/activity/types.ts` — TypeScript interfaces
- `product-plan/sections/activity/sample-data.json` — Test data

## Done When

- [ ] Activity feed renders all events in reverse-chronological order
- [ ] Events grouped correctly by date
- [ ] Agent filter dropdown works: select an agent, shows avatar, clears correctly
- [ ] Event type pills toggle correctly (one active at a time)
- [ ] Combined filters narrow the feed
- [ ] "Clear" button appears only when filters are active
- [ ] Empty state shows when no events match
- [ ] Status icons render correctly (success/failed/running/info)
- [ ] Responsive on mobile
