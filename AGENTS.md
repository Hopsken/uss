# AGENTS.md

## What This Is

USS — AI agent command center for OpenClaw. Gives a unified UI to manage agents, tasks, activity, usage, and skills. Sections: Bridge, Agents, Tasks, Activity, Usage, Skills.

## Commands

```bash
# Root — runs all packages via Turbo
pnpm dev
pnpm build
pnpm typecheck
pnpm lint

# Single package
pnpm --filter @uss/web dev
pnpm --filter @uss/api dev

# DB (runs against packages/db)
pnpm db:generate   # generate migration from schema
pnpm db:migrate    # apply migrations
pnpm db:studio     # open Drizzle Studio
```

## Environment

Copy `.env.example` → `apps/api/.env`. Key vars:

| Var                        | Default                  | Purpose                |
| -------------------------- | ------------------------ | ---------------------- |
| `DATABASE_URL`             | `./apps/api/data/uss.db` | SQLite path            |
| `API_PORT`                 | `8787`                   | Elysia API port        |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8787`  | Web → API              |
| `OPENCLAW_GATEWAY_URL`     | `ws://localhost:18789`   | OpenClaw WS gateway    |
| `OPENCLAW_GATEWAY_TOKEN`   | _(empty)_                | Auth token for gateway |

## Architecture

```
apps/
  api/    — Elysia (Node) REST API, port 8787
  web/    — Next.js 15 App Router frontend, port 3000
packages/
  db/     — Drizzle ORM + libSQL (SQLite)
  shared/ — TypeScript types shared between api and web
  config/ — Base tsconfig
```

**Data flow:** Next.js Server Components → `GET /v1/bridge` → OpenClaw gateway (WebSocket). API falls back to last SQLite snapshot if gateway is unreachable.

**Package names:** `@uss/api`, `@uss/web`, `@uss/db`, `@uss/shared`

### API (`apps/api`)

- `src/index.ts` — Elysia app, routes: `GET /v1/health`, `GET /v1/bridge`
- `src/bridge.ts` — Connects to OpenClaw gateway via WebSocket, calls `agents.list`, `status`, `usage.cost`, `usage.status`, `cron.runs`, `cron.list`; maps raw frames → `BridgeResponse`; persists snapshot to SQLite as fallback

### Web (`apps/web`)

- Next.js App Router; pages are in `app/` (Server Components doing data fetch)
- `src/lib/api.ts` — typed fetch wrappers against the API
- `src/lib/theme.ts` — Mantine theme (sky/amber/slate palette)
- `src/components/shell/` — `AppShell`, `MainNav`, shell types
- `src/components/bridge/` — Bridge dashboard components
- `src/components/ShellFrame.tsx` — client wrapper that wires up shell + router

### DB (`packages/db`)

- SQLite via `@libsql/client` + Drizzle ORM
- `src/schema.ts` — `bootstrap_meta`, `bridge_snapshot` tables
- No migrations folder yet; use `db:generate` then `db:migrate`

### Shared (`packages/shared`)

- Pure TypeScript types, no runtime deps
- `src/index.ts` — all exported types: `BridgeResponse`, `BridgeAgent`, `SystemHealth`, `UsageSnapshot`, etc.

## Design System

- **Colors:** `sky` (primary), `amber` (warnings/busy), `slate` (neutral)
- **Fonts:** Space Grotesk (headings) · Inter (body) · JetBrains Mono (code)
- **UI lib:** Mantine v7 + lucide-react icons
- Loaded from Google Fonts in `app/layout.tsx`

## Implementation Sequence

Product plan lives in `product-plan/`. Milestones: Shell → Bridge → Agents → Tasks → Activity → Usage → Skills. Bridge is implemented; others are placeholders.

## Gateway Usage Reference

- For OpenClaw Gateway event/method integration in this repo, read:
  - `docs/openclaw-gateway-events.md`

## Notes

- Usage API integration lives under `apps/api/src/modules/usage/`.
- Frontend sends concrete `startDate/endDate`; backend does not hardcode named time ranges.
- Usage responses are cached in SQLite (`usage_cache`) for fast repeat reads.
