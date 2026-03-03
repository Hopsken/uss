# Usage — UI Behavior Tests

## Summary Tiles

- [ ] Four metric tiles render: Total Cost, Total Tokens, Conversations, Task Runs
- [ ] Total Cost tile has sky blue accent (highlighted as primary metric)
- [ ] Cost formatted with `$` prefix and 2 decimal places (e.g. "$24.31")
- [ ] Token counts formatted with K/M suffix (e.g. "1.2M tokens")
- [ ] All numeric values use JetBrains Mono font

## Time Range Selector

- [ ] Four tab pills visible: This Week, This Month, Last Month, All Time
- [ ] Active pill is highlighted (sky/filled)
- [ ] Clicking a pill fires `onTimeRangeChange(range)` with the selected range
- [ ] Active pill matches `activeTimeRange` prop
- [ ] Switching tabs visually updates the active pill immediately

## Daily Spend Chart

- [ ] Bar chart renders with one bar per day in the selected range
- [ ] Bar heights are proportional to the cost value for that day
- [ ] X-axis shows date labels (abbreviated)
- [ ] Y-axis or reference scale shows cost values
- [ ] Hovering over a bar shows a tooltip with exact cost ("$1.23")
- [ ] Date range label shown (e.g. "Feb 24 – Mar 3")
- [ ] Chart does not render when `timeSeries` is empty

## Agent Breakdown

- [ ] Horizontal bar chart shows all agents sorted by cost (highest first)
- [ ] Top-spending agent bar is highlighted in amber; others in sky
- [ ] Agent names and avatars visible on the bar chart
- [ ] Agent table shows all columns: Agent (avatar + name), Cost, Tokens, Conversations, Task Runs
- [ ] Table rows sorted by cost descending
- [ ] Numbers in table use JetBrains Mono
- [ ] "Conversations" and "Task Runs" columns hidden on mobile

## Model Breakdown

- [ ] Model table renders with columns: Model, Cost, Tokens, Conversations, Task Runs
- [ ] Model name shown in regular text; model ID shown in small monospace text below
- [ ] Table sorted by cost descending
- [ ] Numbers use JetBrains Mono

## Layout & Responsiveness

- [ ] Page is a single scrollable column
- [ ] Summary tiles: 4 across on desktop, 2×2 on tablet, 1 column on mobile
- [ ] Chart fills full width of the content area
- [ ] Tables horizontally scrollable on mobile
