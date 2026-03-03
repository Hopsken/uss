# Skills — UI Behavior Tests

## Skills List

- [ ] Header shows total skill count and a needs-setup count badge (amber pill)
- [ ] System group rendered first
- [ ] Each agent group follows System, with agent avatar + name in the group header
- [ ] Group header shows the count of skills in that group
- [ ] Clicking a group header collapses/expands it
- [ ] Each skill row shows: category badge, name, description (truncated), config status indicator, last used, toggle switch

## Search

- [ ] Search bar is sticky at the top of the list
- [ ] Typing filters groups and skills in real-time (matches name, description, category)
- [ ] Groups with no matching skills disappear from the list while filtering
- [ ] X button clears the search and restores the full list
- [ ] "No skills match" empty state shown when no results

## Toggle Switch

- [ ] Toggle switch reflects current `skill.enabled` state
- [ ] Clicking the toggle changes its state immediately (optimistic UI)
- [ ] `onToggleSkill(skillId, agentId, newEnabled)` fires on toggle click
- [ ] Toggle click does not open the config panel

## Skill Selection (Desktop)

- [ ] Clicking a skill row highlights it with a left-border accent
- [ ] Config panel opens on the right side of the layout
- [ ] `onSelectSkill(skillId, agentId)` fires when a skill is clicked
- [ ] Clicking the same skill again or pressing X closes the panel → `onClosePanel()` fires
- [ ] Selected skill stays highlighted while panel is open

## Skill Selection (Mobile)

- [ ] Tapping a skill row opens a bottom sheet (88dvh height)
- [ ] Bottom sheet has a drag handle at the top and rounded top corners
- [ ] Tapping the dark backdrop dismisses the sheet → `onClosePanel()` fires
- [ ] X button inside the sheet dismisses it
- [ ] Bottom sheet does not change the list layout behind it

## Config Panel — Config Tab

- [ ] "Config" tab is active by default when panel opens
- [ ] Shows: skill description, config status, last used time
- [ ] Shows all config fields with labels and current values
- [ ] Secret/password fields have masked values (dots) and a reveal toggle
- [ ] Editing a field makes the "Save changes" button active
- [ ] "Save changes" button is disabled when no changes have been made
- [ ] Clicking "Save changes" fires `onSaveConfig(skillId, agentId, updatedConfig)`
- [ ] If `skill.config` is empty, no fields or save button are shown

## Config Panel — SKILL.md Tab

- [ ] "SKILL.md" tab only visible when `skill.instructions` is non-empty
- [ ] Tab renders skill instructions as styled markdown
- [ ] Frontmatter block (if present) shown in a code-style monospace block at the top
- [ ] Body renders with styled headings, lists, and code spans

## Assign to Agent

- [ ] "Assigned to" section shows all available agents as buttons
- [ ] Currently assigned agent button is highlighted in sky blue
- [ ] Clicking a different agent fires `onAssignSkill(skillId, targetAgentId)`
- [ ] System group skills show all agents (can be assigned to any)

## Layout & Responsiveness

- [ ] Desktop: list on the left, config panel on the right (split layout)
- [ ] Mobile: full-width list, config panel as bottom sheet overlay
- [ ] Group headers and skill rows readable on all screen sizes
