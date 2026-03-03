# Skills

The Skills section displays all OpenClaw skills assigned to each agent. Users can browse, toggle, and configure skills, and reassign them to different agents.

## Layout

- Skills grouped by agent: System group first (global skills), then one group per agent
- Each group is collapsible via its header
- Search bar at the top filters all groups by name, description, or category
- Selecting a skill opens a config panel (desktop: right side panel; mobile: bottom sheet)

## Components

- `Skills` — Complete skills manager (list + desktop panel + mobile bottom sheet; single self-contained component)

## Props

```tsx
interface SkillsProps {
  systemSkills: Skill[]
  agentGroups: AgentSkillGroup[]
  selectedSkillId?: string | null
  selectedAgentId?: string | null  // null = system group
  onToggleSkill?: (skillId: string, agentId: string | null, enabled: boolean) => void
  onSelectSkill?: (skillId: string, agentId: string | null) => void
  onClosePanel?: () => void
  onSaveConfig?: (skillId: string, agentId: string | null, config: SkillConfig[]) => void
  onAssignSkill?: (skillId: string, targetAgentId: string) => void
}
```

## Design Notes

- Config panel has two tabs: "Config" (edit fields, save) and "SKILL.md" (view markdown instructions)
- SKILL.md tab only shown when `skill.instructions` exists
- Config status: "Configured" (emerald) or "Needs setup" (amber with warning icon)
- Needs-setup count shown as amber warning pill in the header
- Mobile bottom sheet: 88dvh height, rounded top corners, drag handle at top
- Assign-to-agent: currently active agent button highlighted in sky, clicking fires `onAssignSkill`
