# Usage

The Usage section is a cost and token dashboard showing the fleet's AI consumption over the selected time period, broken down by agent and model.

## Layout

- **Summary row:** Four metric tiles — Total Cost (sky accent), Total Tokens, Conversations, Task Runs
- **Time range selector:** Tab-style pills — This Week / This Month / Last Month / All Time
- **Daily chart:** Bar chart of daily spend with hover tooltips showing exact cost
- **By agent:** Horizontal bar chart comparison + full sortable table (avatar, name, cost, tokens, conversations, task runs)
- **By model:** Table showing per-model cost, tokens, conversations, task runs

## Components

- `Usage` — Complete usage dashboard (all panels in one self-contained component)

## Props

```tsx
interface UsageProps {
  summary: UsageSummary
  timeSeries: TimeSeriesPoint[]
  agents: AgentUsage[]
  modelBreakdown: ModelUsage[]
  activeTimeRange: TimeRange
  onTimeRangeChange?: (range: TimeRange) => void
}

type TimeRange = 'this_week' | 'this_month' | 'last_month' | 'all_time'
```

## Design Notes

- Total Cost tile uses sky blue accent to highlight it as the primary metric
- Top agent in bar chart highlighted in amber; others in sky
- All numeric values use JetBrains Mono for consistent monospace formatting
- Cost formatted with `$` prefix; tokens formatted with K/M suffixes
- Mobile: Conversations and Tasks columns hide on small screens
