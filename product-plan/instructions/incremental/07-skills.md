# Milestone 7: Skills

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1–6 complete

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

Implement the Skills section — a management interface for browsing, toggling, and configuring OpenClaw skills.

## Overview

Skills displays all OpenClaw skills synced from the system, organized by agent group (plus a System group for global skills). Users can toggle skills on/off, click a skill to view its details and configuration, edit config fields (including masked secrets), and assign a skill to a different agent.

**Key Functionality:**
- Skills grouped by agent (System group first, then one group per agent)
- Search bar filters across all groups by name, description, or category
- Needs-setup count badge in header (amber warning pill)
- Toggle switch on each skill row (enables/disables inline)
- Left-border accent on selected skill row
- Desktop: clicking a skill opens the config panel on the right
- Mobile: clicking a skill opens a bottom sheet overlay panel
- Config panel: two tabs — "Config" (edit fields, save button) and "SKILL.md" (view markdown instructions)
- Assign-to-agent picker in the config panel

## Components Provided

Copy from `product-plan/sections/skills/components/`:

- `Skills` — Complete skills manager (list + desktop panel + mobile bottom sheet)

## Props Reference

```typescript
interface SkillsProps {
  systemSkills: Skill[]          // Global skills (System group)
  agentGroups: AgentSkillGroup[] // Per-agent skill groups
  selectedSkillId?: string | null
  selectedAgentId?: string | null  // null = system group
  onToggleSkill?: (skillId: string, agentId: string | null, enabled: boolean) => void
  onSelectSkill?: (skillId: string, agentId: string | null) => void
  onClosePanel?: () => void
  onSaveConfig?: (skillId: string, agentId: string | null, config: SkillConfig[]) => void
  onAssignSkill?: (skillId: string, targetAgentId: string) => void
}
```

## Expected User Flows

### Flow 1: Browse All Skills

1. User navigates to Skills
2. Skills list shows System group first, then one group per agent
3. Each group can be collapsed/expanded by clicking the header
4. Each skill row shows: category badge, name, description, config status, last-used time, toggle
5. **Outcome:** User sees all skills across the fleet

### Flow 2: Search Skills

1. User types in the search bar (sticky at top of list)
2. Groups filter in real-time — groups with no matching skills disappear
3. User clicks X to clear search
4. **Outcome:** User can quickly find a specific skill

### Flow 3: Toggle a Skill

1. User clicks the toggle switch on a skill row
2. Toggle changes state immediately
3. **Outcome:** `onToggleSkill` is called with skillId, agentId, and new enabled state

### Flow 4: Configure a Skill (Desktop)

1. User clicks a skill row → left border accent highlights the row
2. Config panel opens on the right side
3. User sees the "Config" tab with: description, last used, config fields, assign-to-agent buttons
4. User edits a config field (e.g., API key)
5. "Save changes" button activates
6. User clicks "Save changes"
7. **Outcome:** `onSaveConfig` is called with updated config

### Flow 5: Configure a Skill (Mobile)

1. User taps a skill row
2. Bottom sheet slides up from the bottom (88dvh, rounded top corners, drag handle)
3. User edits config and saves (same as desktop)
4. User taps the backdrop or X to dismiss
5. **Outcome:** Same callbacks as desktop; no layout changes to the list

### Flow 6: View SKILL.md Instructions

1. User opens a skill's config panel
2. User clicks the "SKILL.md" tab
3. Panel shows the skill's instruction document as styled markdown
4. Frontmatter (if present) shown in a code-style block at the top
5. **Outcome:** User can read the full skill documentation without opening files

### Flow 7: Assign Skill to Different Agent

1. User opens a skill's Config tab
2. User sees the "Assigned to" section with agent buttons
3. User clicks a different agent's button (currently active agent highlighted in sky)
4. **Outcome:** `onAssignSkill` is called with skillId and targetAgentId

## Empty States

- **No skills at all:** Unlikely but handle gracefully (empty groups should not render)
- **No search results:** Show "No skills match" empty state with "Clear search" link
- **Skill with no config fields:** Config tab shows description and last-used but no fields or save button
- **Skill with no SKILL.md:** SKILL.md tab is hidden (only shown when `skill.instructions` exists)

## Testing

See `product-plan/sections/skills/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/skills/README.md` — Feature overview
- `product-plan/sections/skills/tests.md` — UI behavior test specs
- `product-plan/sections/skills/components/` — React components
- `product-plan/sections/skills/types.ts` — TypeScript interfaces
- `product-plan/sections/skills/sample-data.json` — Test data

## Done When

- [ ] Skills list renders all groups and skills
- [ ] Search bar filters groups and skills in real-time
- [ ] Needs-setup badge shows count in header
- [ ] Toggle switches work and fire `onToggleSkill`
- [ ] Selecting a skill: left-border accent + desktop panel opens
- [ ] Mobile bottom sheet: opens on skill tap, closes on backdrop
- [ ] Config tab: fields editable, save button active only when dirty
- [ ] SKILL.md tab: markdown renders with styled frontmatter block
- [ ] Assign-to-agent buttons: active agent highlighted, clicking fires `onAssignSkill`
- [ ] Responsive on all screen sizes
