# Frontend Data Fetching Decision: Client-Only React Query

## Status

Accepted on 2026-03-05.

## Context

USS is a dashboard-style product. Core pages (Bridge, Agents, Tasks, Skills, Usage) need frequent state updates and low-friction sync after user actions.

The previous approach mixed:

- server-side data fetching (`app/*/page.tsx` calling server fetch helpers)
- hydration/prefetch in some routes
- client mutations followed by `router.refresh()`

This caused:

- state drift risk between server snapshot and client state
- heavier coupling between mutation flow and full route refresh
- slower perceived update loop for dashboard interactions
- harder path to realtime behavior

## Decision

Use **client-only React Query** for dashboard data fetching in web app routes:

- Bridge
- Agents
- Agent detail
- Tasks
- Skills
- Usage

And remove server-side query layer for these pages.

## Scope Boundaries

- Keep Next.js App Router and Server Components for shell/layout/routing boundaries.
- Do not use Server Components as data-query layer for dashboard business data.
- `/activity` is intentionally excluded from this decision for realtime implementation; it will move to websocket-driven updates in a dedicated follow-up.

## Implementation Rules

- Query reads happen in client components via `useQuery`.
- Mutations use `useMutation` + query invalidation, not `router.refresh()`.
- Do not copy query data into local component state unless it is true UI-only state.
- Keep explicit loading/error states in client components (`isPending`, `error`, retry).
- Refresh policy defaults to focus/reconnect refetch (no global interval polling by default).
- Keep URL-driven filters where already part of UX contract (e.g. `/tasks?agentId=...`).

## Consequences

### Benefits

- Better realtime readiness and incremental UI updates.
- Simpler mental model: one async state system for dashboard data.
- Fewer full-route refreshes, better interaction responsiveness.

### Tradeoffs

- Less reliance on HTTP-level semantics from page rendering (e.g. not-found handled inline in client).
- Slightly more responsibility in client components for loading/error handling.

## Current Canonical Paths

- Query client defaults: `apps/web/src/lib/react-query.ts`
- Query keys: `apps/web/src/lib/query-keys.ts`
- API client wrappers: `apps/web/src/lib/api.ts`
- Route entrypoints: `apps/web/app/*/page.tsx`

## Follow-ups

1. Implement websocket feed for `/activity` and integrate with query cache updates.
2. Add integration tests for mutation + invalidation paths on key pages.
3. Periodically tune `staleTime`/`gcTime` by page-level usage patterns.
