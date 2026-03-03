# Application Shell

USS uses a fixed left sidebar layout — a persistent sidebar with the USS wordmark and icon-labeled navigation, and a scrollable content area to the right.

## Layout

- **Desktop (lg+):** Full sidebar 224px wide, content fills remaining space
- **Tablet (md–lg):** Icon-only sidebar 56px wide
- **Mobile:** Fixed top header bar (USS logo + hamburger); tapping hamburger reveals a full-width dropdown nav

## Navigation Items

| Label | Route |
|-------|-------|
| Bridge | /bridge |
| Agents | /agents |
| Tasks | /tasks |
| Activity | /activity |
| Usage | /usage |
| Skills | /skills |
| Settings | /settings (isolated at bottom) |

## Components

- `AppShell` — Main layout wrapper; accepts `children`, `navigationItems`, and `onNavigate`
- `MainNav` — Handles all three responsive states (desktop sidebar, tablet icon-only, mobile header+dropdown)

## Props

```tsx
interface NavItem {
  label: string    // Must match one of the icon map keys (case-insensitive)
  href: string
  isActive?: boolean
}

interface AppShellProps {
  children: ReactNode
  navigationItems: NavItem[]
  onNavigate?: (href: string) => void
}
```

## Design Notes

- `sky` primary color for active nav item text and tint
- `slate` for sidebar backgrounds, borders, inactive text
- Space Grotesk for USS wordmark and nav labels
- No user menu (single-user tool, no authentication required)
