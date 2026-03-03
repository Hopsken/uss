# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture.

## Entities

- **Agent** — An OpenClaw agent with role, status, model, and runtime metadata (used in: bridge, agents, tasks, activity, usage, skills)
- **Task** — A unit of work assigned to an agent, with schedule, status, and execution history (used in: tasks, bridge)
- **TaskTemplate** — A reusable task blueprint with default instructions (used in: tasks)
- **AgentPreInstructions** — Per-agent default instructions prepended to all their tasks (used in: tasks)
- **ActivityEvent** — A single recorded agent action with type and status (used in: activity)
- **Skill** — An OpenClaw capability with configuration fields (used in: skills, agents)
- **UsageRecord** / **AgentUsage** / **ModelUsage** — Cost and token consumption data (used in: usage, bridge, agents)
- **SystemHealth** — OpenClaw process status and provider connectivity (used in: bridge)

## Per-Section Types

Each section includes its own `types.ts` with the full interface definitions:

- `sections/bridge/types.ts`
- `sections/agents/types.ts`
- `sections/tasks/types.ts`
- `sections/activity/types.ts`
- `sections/usage/types.ts`
- `sections/skills/types.ts`

## Combined Reference

See `overview.ts` for all entity types aggregated in one file.
