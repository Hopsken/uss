# Milestone 6: Usage

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1–5 complete

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

Implement the Usage section — a cost and token consumption dashboard for the agent fleet.

## Overview

Usage provides a top-level summary of total spend, tokens, conversations, and task runs for the selected time period, a daily cost time series chart, a per-agent comparison, and a model breakdown table.

**Key Functionality:**
- Four metric tiles: Total Cost (primary accent), Tokens, Conversations, Task Runs
- Time range selector: This week / This month / Last month / All time
- Daily cost bar chart with hover tooltips showing the exact cost
- Per-agent horizontal bar chart (highest spender highlighted in amber)
- Agent table: avatar, name, cost, tokens, conversations, task runs
- Model breakdown table with the same columns
- All numeric values use JetBrains Mono for monospace formatting

## Components Provided

Copy from `product-plan/sections/usage/components/`:

- `Usage` — Complete usage dashboard (all panels in one component)

## Props Reference

```typescript
interface UsageProps {
  summary: UsageSummary          // Totals for selected time range
  timeSeries: TimeSeriesPoint[]  // Daily data points for chart
  agents: AgentUsage[]           // Per-agent breakdown
  modelBreakdown: ModelUsage[]   // Per-model breakdown
  activeTimeRange: TimeRange     // Current selection
  onTimeRangeChange?: (range: TimeRange) => void
}

type TimeRange = 'this_week' | 'this_month' | 'last_month' | 'all_time'
```

## Expected User Flows

### Flow 1: Check Total Spend

1. User navigates to Usage
2. User sees four metric tiles: Total Cost, Tokens Used, Conversations, Tasks Run
3. Total Cost is highlighted in sky blue (primary accent)
4. **Outcome:** User sees the total fleet spend for the current period at a glance

### Flow 2: Switch Time Range

1. User clicks a time range pill (This month, Last month, All time)
2. All data updates: tiles, chart, agent table, model table
3. **Outcome:** `onTimeRangeChange` is called with the selected range; parent re-fetches data

### Flow 3: Read the Daily Chart

1. User looks at the Daily spend bar chart
2. Each bar represents one day in the selected range
3. User hovers over a bar → tooltip shows exact cost ("$1.23")
4. Date range shown in upper right ("Feb 24 – Mar 3")
5. **Outcome:** User identifies peak spending days

### Flow 4: Compare Agents

1. User scrolls to the "By agent" section
2. Horizontal bar chart shows all agents sorted by cost (highest first)
3. Top spender bar is amber; others are sky blue
4. Table below shows full breakdown: cost, tokens, conversations, task runs
5. **Outcome:** User identifies which agents consume the most resources

### Flow 5: Review Model Breakdown

1. User scrolls to the "By model" section
2. Table shows each AI model used, sorted by cost
3. Model ID shown in small monospace text below the model name
4. **Outcome:** User can attribute costs to specific model choices

## Empty States

- **No time series data:** `SpendChart` returns null and doesn't render
- **No agents:** The "By agent" section should show empty tables gracefully

## Testing

See `product-plan/sections/usage/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/usage/README.md` — Feature overview
- `product-plan/sections/usage/tests.md` — UI behavior test specs
- `product-plan/sections/usage/components/` — React components
- `product-plan/sections/usage/types.ts` — TypeScript interfaces
- `product-plan/sections/usage/sample-data.json` — Test data

## Done When

- [ ] Four metric tiles render with correct values
- [ ] Time range selector: switching ranges triggers `onTimeRangeChange`
- [ ] Daily cost chart renders bars proportional to cost values
- [ ] Chart hover tooltips show cost
- [ ] Agent bar chart shows all agents sorted by cost, top agent in amber
- [ ] Agent table shows all columns (Cost, Tokens, Convos, Tasks)
- [ ] Model breakdown table renders correctly
- [ ] Numbers formatted consistently ($ prefix for costs, K/M suffixes for tokens)
- [ ] JetBrains Mono applied to all numeric values
- [ ] Responsive: Convos and Tasks columns hide on mobile
