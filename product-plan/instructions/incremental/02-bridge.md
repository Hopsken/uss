# Milestone 2: Bridge

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

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

Implement the Bridge — the command center overview dashboard shown when USS first loads.

## Overview

Bridge is a read-only snapshot of the entire system. It shows which agents are active, recent task execution history, current system health (OpenClaw process + provider connectivity), and a quick usage summary. All items link out to their respective sections for deeper detail.

**Key Functionality:**
- Horizontal scrollable row of agent cards — each showing avatar, name, role, model pill, and status dot
- Compact list of the last 6–8 task runs with status, agent name, and relative timestamp
- System health panel: OpenClaw process status + per-provider API connectivity + recent errors/warnings
- Two usage tiles: "Today" and "This Week" — each showing cost, tokens, and conversations
- Clicking any item navigates to the relevant section

## Components Provided

Copy from `product-plan/sections/bridge/components/`:

- `Bridge` — Main dashboard layout, accepts all data props
- `AgentCard` — Compact agent card (avatar, name, role, model, status dot)
- `TaskRunRow` — Single task run row with status icon, task name, agent badge, timestamp
- `HealthPanel` — OpenClaw process status + providers + error alerts
- `UsageTile` — Single period usage tile (cost + tokens + conversations)

## Props Reference

```typescript
interface BridgeProps {
  agents: Agent[]               // Fleet agents to show in the status strip
  recentTaskRuns: RecentTaskRun[] // Last 6-8 task runs across all agents
  systemHealth: SystemHealth    // OpenClaw + provider + error data
  usageSnapshot: UsageSnapshot  // Today + this week periods
  onViewAgents?: () => void     // Navigate to Agents section
  onViewAgent?: (agentId: string) => void  // Navigate to specific agent detail
  onViewTasks?: () => void      // Navigate to Tasks section
  onViewTaskRun?: (taskRunId: string) => void // Navigate to specific task
  onViewUsage?: () => void      // Navigate to Usage section
}
```

## Expected User Flows

### Flow 1: Check Fleet Status

1. User opens USS — Bridge loads as the default screen
2. User sees agent cards in a horizontal scrollable strip
3. User sees status dots (grey = idle, pulsing sky = busy, red = error)
4. **Outcome:** User knows at a glance which agents are active and what they're working on

### Flow 2: Review Recent Tasks

1. User scans the Recent Tasks list (last 6–8 runs)
2. User sees task name, assigned agent, status badge, and relative time ("3m ago")
3. User clicks a task row
4. **Outcome:** User is navigated to the Tasks section

### Flow 3: Check System Health

1. User looks at the System Health panel
2. User sees OpenClaw process status (Running/Stopped/Error) with uptime and version
3. User sees provider statuses (green/amber/red dots) with latency
4. User sees any recent errors or warnings
5. **Outcome:** User can identify connectivity issues without opening logs

### Flow 4: Quick Usage Check

1. User glances at the two usage tiles
2. User sees today's cost and this week's cost at a glance
3. User clicks a tile
4. **Outcome:** User is navigated to the Usage section

## Empty States

- **No agents:** The agent strip should show an empty state or placeholder
- **No recent tasks:** The recent tasks list should show "No recent task runs"
- **No errors:** The error section in HealthPanel should simply not render (handled internally)

## Testing

See `product-plan/sections/bridge/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/bridge/README.md` — Feature overview
- `product-plan/sections/bridge/tests.md` — UI behavior test specs
- `product-plan/sections/bridge/components/` — React components
- `product-plan/sections/bridge/types.ts` — TypeScript interfaces
- `product-plan/sections/bridge/sample-data.json` — Test data

## Done When

- [ ] Bridge renders with real data from your backend
- [ ] Agent status strip shows all agents with correct status dots
- [ ] Recent tasks list renders with status icons and timestamps
- [ ] System health shows OpenClaw process + providers + errors
- [ ] Usage tiles show cost and token counts
- [ ] All navigation callbacks wire to correct routes
- [ ] Responsive on mobile
