# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

Set up the design tokens and application shell — the persistent navigation and layout that wraps all sections.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for color usage patterns
- See `product-plan/design-system/fonts.md` for Google Fonts setup

Key settings:
- **Primary:** `sky` (buttons, active nav, links)
- **Secondary:** `amber` (warnings, busy status)
- **Neutral:** `slate` (backgrounds, borders, text)
- **Fonts:** Space Grotesk (headings/labels), Inter (body), JetBrains Mono (numbers/code)

### 2. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper (flex row: sidebar + content)
- `MainNav.tsx` — Navigation with 3 responsive states
- `index.ts` — Exports

**Wire Up Navigation:**

Connect navigation to your routing system. The `onNavigate` callback receives the `href` string:

```tsx
<AppShell
  navigationItems={[
    { label: 'Bridge', href: '/bridge', isActive: currentPath === '/bridge' },
    { label: 'Agents', href: '/agents', isActive: currentPath === '/agents' },
    { label: 'Tasks', href: '/tasks', isActive: currentPath === '/tasks' },
    { label: 'Activity', href: '/activity', isActive: currentPath === '/activity' },
    { label: 'Usage', href: '/usage', isActive: currentPath === '/usage' },
    { label: 'Skills', href: '/skills', isActive: currentPath === '/skills' },
    { label: 'Settings', href: '/settings', isActive: currentPath === '/settings' },
  ]}
  onNavigate={(href) => router.push(href)}
>
  {children}
</AppShell>
```

**Important:** The `label` field is used to look up the nav icon. It must match one of: `bridge`, `agents`, `tasks`, `activity`, `usage`, `skills`, `settings` (case-insensitive).

**No User Menu:** USS is a single-user personal tool with no authentication. There's no login flow or user menu.

### 3. Responsive Behavior

The shell handles all three layouts automatically:
- **Desktop (lg+):** Full 224px sidebar with labels
- **Tablet (md–lg):** 56px icon-only sidebar
- **Mobile:** Fixed 56px top header with hamburger → full-width dropdown nav

The main content area gets `pt-14 md:pt-0` to account for the mobile top bar.

## Files to Reference

- `product-plan/design-system/` — Design tokens (colors, fonts)
- `product-plan/shell/README.md` — Shell design intent and layout spec
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens configured (fonts loaded, Tailwind color classes working)
- [ ] Shell renders with all 7 navigation items
- [ ] Active nav item highlighted in sky blue
- [ ] Navigation triggers routing
- [ ] Full sidebar visible on desktop
- [ ] Icon-only sidebar on tablet
- [ ] Header + hamburger menu on mobile
- [ ] Settings item isolated at the bottom of the sidebar
