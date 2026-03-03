# Milestone 3: Agents

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1–2 complete

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

Implement the Agents section — the full crew roster and per-agent detail view.

## Overview

The Agents section lets users browse all OpenClaw agents synced from the system, inspect each agent's configuration and recent activity, and change the AI model assigned to an agent.

**Key Functionality:**
- Responsive card grid (4 columns desktop → 2 tablet → 1 mobile) showing all agents
- "Sync from OpenClaw" button to refresh the agent list
- Agent detail page with stats, recent tasks, bound skills, and config doc viewer
- Model selector dropdown to change which AI model powers an agent
- Two-panel config doc viewer: file list on the left, markdown content on the right

## Components Provided

Copy from `product-plan/sections/agents/components/`:

- `AgentsList` — Responsive card grid with header and sync button
- `AgentCard` — Individual agent card (avatar, name, role, status, model badge)
- `AgentDetail` — Full detail page with stats, tasks, skills, model selector, and config docs

## Props Reference

```typescript
// List view
interface AgentsListProps {
  agents: Agent[]
  isSyncing?: boolean
  onSelectAgent?: (agentId: string) => void  // Navigate to detail
  onSync?: () => void                         // Trigger OpenClaw sync
}

// Detail view
interface AgentDetailProps {
  agent: Agent
  availableModels: AgentModel[]
  onBack?: () => void                        // Navigate back to list
  onChangeModel?: (agentId: string, modelId: string) => void
  onViewTasks?: (agentId: string) => void   // Navigate to Tasks filtered by agent
}
```

## Expected User Flows

### Flow 1: Browse the Agent Roster

1. User navigates to Agents
2. User sees a card grid of all agents
3. Each card shows robohash avatar, name, role, animated status dot, model badge
4. User identifies which agents are busy (pulsing amber dot) or have errors (red dot)
5. **Outcome:** User has a quick overview of the entire fleet

### Flow 2: Sync Agents from OpenClaw

1. User clicks "Sync from OpenClaw" button
2. Button shows spinning icon while syncing
3. **Outcome:** Agent list refreshes with latest config from OpenClaw

### Flow 3: View Agent Detail

1. User clicks an agent card
2. Detail page loads with: avatar, name, role, status, model selector, stat tiles
3. User sees Recent Tasks list and Skills list in a 2-column grid
4. User sees Configuration section with a file list and content viewer
5. **Outcome:** User understands the agent's current state and configuration

### Flow 4: Change Agent Model

1. User opens an agent's detail page
2. User clicks the model selector dropdown (shows current model)
3. User selects a different model from the list
4. **Outcome:** `onChangeModel` is called with agentId and new modelId

### Flow 5: View Agent's Config Docs

1. User scrolls to the Configuration section on agent detail
2. User sees a list of config files (AGENTS.md, SOUL.md, etc.) on the left
3. User clicks a file name
4. File content renders as styled markdown on the right
5. **Outcome:** User can read the agent's full configuration without opening files

## Empty States

- **No agents:** Show an empty state in the grid with a "Sync from OpenClaw" CTA
- **No recent tasks:** `AgentDetail` shows "No recent tasks" in the tasks panel
- **No skills:** `AgentDetail` shows "No skills configured" in the skills panel
- **No config docs:** Config section should handle gracefully

## Testing

See `product-plan/sections/agents/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/agents/README.md` — Feature overview
- `product-plan/sections/agents/tests.md` — UI behavior test specs
- `product-plan/sections/agents/components/` — React components
- `product-plan/sections/agents/types.ts` — TypeScript interfaces
- `product-plan/sections/agents/sample-data.json` — Test data

## Done When

- [ ] Agent card grid renders with real data
- [ ] Status dots animate correctly (pulsing for busy)
- [ ] Sync button triggers `onSync` and shows loading state
- [ ] Clicking a card navigates to agent detail
- [ ] Agent detail shows all stats, tasks, skills, and config docs
- [ ] Model selector opens, shows available models, triggers `onChangeModel`
- [ ] Config doc viewer: clicking a file shows its content
- [ ] Markdown in config docs renders with styled headings and lists
- [ ] Responsive on mobile
