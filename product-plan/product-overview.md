# USS — Product Overview

## Summary

USS is a personal AI agent command center for OpenClaw. It gives you a unified interface to manage your AI crew — view agent status, assign tasks, monitor activity, track usage and costs, and configure skills — without needing to interact through chat apps or config files.

## Planned Sections

1. **Bridge** — The command center overview — active agents, recent activity highlights, current tasks in flight, and a quick health snapshot. The first screen you open.
2. **Agents** — The full crew roster — each agent's role, avatar, assigned model, current status, and recent task history. Syncs from OpenClaw.
3. **Tasks** — Task dispatch and scheduling — organized by agent in a kanban-style view. Supports one-time tasks, recurring schedules, reusable templates, and pre-instructions per agent.
4. **Activity** — A chronological feed of agent actions across the fleet — what ran, when, and what happened. Useful for auditing and debugging.
5. **Usage** — Cost and token tracking — total spend, token consumption, conversation count, and activity over time. Breakdowns by agent and by model.
6. **Skills** — OpenClaw skills management — browse, configure, and toggle agent-specific and system-wide skills.

## Product Entities

- **Agent** — An OpenClaw agent with a fixed role, unique avatar, and operational status. Synced from OpenClaw.
- **Task** — A unit of work assigned to a specific agent. One-time or recurring scheduled job.
- **TaskTemplate** — A reusable task blueprint for quickly spinning up recurring work patterns.
- **Schedule** — A recurring rule (cron or interval) attached to a Task.
- **ActivityEvent** — A single recorded action taken by an agent — task execution, skill invocation, conversation, or system event.
- **Skill** — A discrete OpenClaw capability attachable to an agent or applied system-wide.
- **UsageRecord** — Token consumption, cost, and conversation count for a given agent and model.
- **Model** — An AI model available as a backend for agents.

## Design System

**Colors:**
- Primary: `sky` — Buttons, links, active states, key accents
- Secondary: `amber` — Warnings, alerts, status badges, "busy" indicators
- Neutral: `slate` — Backgrounds, borders, inactive text

**Typography:**
- Heading: Space Grotesk
- Body: Inter
- Mono: JetBrains Mono

## Implementation Sequence

Build this product in milestones:

1. **Shell** — Set up design tokens and application shell (sidebar navigation, responsive layout)
2. **Bridge** — Command center dashboard with fleet status, recent tasks, system health, and usage snapshot
3. **Agents** — Agent roster card grid + agent detail page with config docs viewer
4. **Tasks** — Kanban board + task detail modal + templates + pre-instructions editor
5. **Activity** — Activity feed with agent/type filters, grouped by date
6. **Usage** — Usage metrics tiles + time series chart + agent and model breakdown
7. **Skills** — Skills list grouped by agent + side panel for config editing

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
