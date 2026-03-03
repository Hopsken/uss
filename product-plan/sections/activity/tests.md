# Activity — UI Behavior Tests

## Feed Rendering

- [ ] Events displayed in reverse-chronological order (newest first)
- [ ] Events grouped under date headers: "Today", "Yesterday", then formatted dates (e.g. "Mon, Feb 23")
- [ ] Each event row shows: colored left-border status bar, agent avatar, agent name, type badge, description, relative timestamp, status icon
- [ ] Status icon: checkmark for success, X for failed, pulsing spinner for running, info circle for info
- [ ] Status left-border: emerald (success), red (failed), amber (running), slate (info)
- [ ] Type badges: "Task" (sky), "Skill" (purple), "Chat" (teal), "System" (slate)
- [ ] Relative timestamps: "just now", "5m ago", "2h ago", "Yesterday at 3:42pm"

## Agent Filter

- [ ] "All agents" dropdown visible in filter bar
- [ ] Dropdown lists all agents with robohash avatars
- [ ] Selecting an agent filters the feed to show only that agent's events
- [ ] Selected agent name shown in the dropdown button
- [ ] Clicking the agent's X or selecting "All agents" clears the filter
- [ ] `onFilterByAgent(agentId)` fires when an agent is selected
- [ ] `onFilterByAgent(null)` fires when the filter is cleared

## Event Type Filter

- [ ] Four type pills visible: Task, Skill, Chat, System
- [ ] Clicking a pill activates it (highlighted) and filters the feed
- [ ] Only one type can be active at a time
- [ ] Clicking the active pill again deactivates it (clears the type filter)
- [ ] `onFilterByType(eventType)` fires when a pill is activated
- [ ] `onFilterByType(null)` fires when the active pill is clicked again

## Combined Filtering

- [ ] Setting both an agent and a type filter narrows to events matching both
- [ ] "Clear" button appears in the filter bar when any filter is active
- [ ] Clicking "Clear" resets both filters: calls `onFilterByAgent(null)` and `onFilterByType(null)`
- [ ] "Clear" button disappears when no filters are active

## Empty States

- [ ] Empty state shown when no events match the current filters
- [ ] Empty state shows appropriate icon, "No events found", and guidance text
- [ ] "Clear filters" link in empty state fires both clear callbacks

## Responsiveness

- [ ] Filter bar usable on mobile (pills wrap or scroll horizontally)
- [ ] Event rows readable on narrow screens
- [ ] Agent avatars displayed at appropriate size on mobile
