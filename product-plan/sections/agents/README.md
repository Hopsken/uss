# Agents

The Agents section displays the full roster of OpenClaw agents and lets users inspect each agent's configuration, recent activity, and change its AI model.

## Views

- **List view:** Responsive card grid (4 columns desktop → 2 tablet → 1 mobile) with a "Sync from OpenClaw" button
- **Detail view:** Full agent page with stats, recent tasks, bound skills, model selector, and config doc viewer

## Components

- `AgentsList` — Responsive card grid with header and sync button
- `AgentCard` — Individual agent card (robohash avatar, name, role, status dot, model badge)
- `AgentDetail` — Full detail page with stats, tasks, skills, model selector, and two-panel config doc viewer

## Props

```tsx
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

## Design Notes

- Status badges: idle (slate), busy (pulsing amber dot), error (red)
- Config doc viewer: left panel lists filenames (AGENTS.md, SOUL.md, etc.), right panel renders selected file as styled markdown
- Model selector shows current model name and allows changing from available models list
- Robohash avatars keyed by agent ID
