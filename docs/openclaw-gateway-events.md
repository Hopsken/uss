# OpenClaw Gateway Events and Usage Integration

This doc explains how `uss` consumes OpenClaw Gateway traffic for the Usage dashboard.

## Scope

- Source files:
  - `apps/api/src/modules/usage/usage.gateway.repository.ts`
  - `apps/api/src/modules/usage/usage.service.ts`
  - `apps/api/src/modules/usage/usage.mapper.ts`
  - `packages/gateway-client/src/client.ts`
  - `packages/gateway-client/src/types.ts`

## Transport Model

Gateway client uses WebSocket JSON frames:

- Request frame (`type: "req"`): method + params
- Response frame (`type: "res"`): `ok` + payload or error
- Event frame (`type: "event"`): async server event

Relevant event currently handled by client:

- `connect.challenge`
  - payload includes `nonce`
  - required during handshake before `connect` request succeeds

## Usage Data Methods

Usage module (`/v1/usage`) aggregates from these Gateway methods:

1. `sessions.usage`
- Purpose: cost/tokens totals, daily series, per-agent, per-model aggregates, sessions list
- Params sent by `uss`:
  - `startDate` (`YYYY-MM-DD`)
  - `endDate` (`YYYY-MM-DD`)
  - `mode` (`gateway | utc | specific`)
  - `limit` (`Number.MAX_SAFE_INTEGER`)
  - `utcOffset` only when `mode === "specific"`

2. `cron.list`
- Purpose: load all cron jobs (for run -> job -> agent/model attribution)
- Pagination params:
  - `includeDisabled: true`
  - `limit: 200`
  - `offset`
- Loop continues while `hasMore === true` or `nextOffset > collected`

3. `cron.runs`
- Purpose: task run counts in requested date range
- Pagination params:
  - `scope: "all"`
  - `sortDir: "desc"`
  - `limit: 200`
  - `offset`
- Loop behavior same as `cron.list`

4. `agents.list`
- Purpose: resolve `agentId -> agentName`

5. `models.list`
- Purpose: resolve `modelId -> modelName`

## API Contract in `uss`

`GET /v1/usage` query:

- `startDate` (required)
- `endDate` (required)
- `mode` (optional, default `gateway`)
- `utcOffset` (optional, only for `specific`)

Response shape:

- `summary`
- `timeSeries`
- `agents`
- `modelBreakdown`

All fields are produced in `usage.mapper.ts`.

## Caching Path (SQLite)

`usage.service.ts` adds read-through cache via `usage_cache` table:

- Cache key: `startDate|endDate|mode|utcOffset`
- Adaptive TTL:
  - <= 7 days: 30s
  - <= 31 days: 120s
  - <= 180 days: 300s
  - > 180 days: 900s
- Fallback behavior:
  - If live Gateway fetch fails, return cached payload when cache age <= 24h
- Prune:
  - delete entries older than 30 days

## Frontend Time Range Flow

Frontend owns presets and sends concrete dates:

1. User picks range in UI.
2. Web app computes `startDate/endDate`.
3. Calls API with those exact dates.
4. Backend does not hardcode named ranges.

This keeps date logic flexible on frontend while preserving one stable usage endpoint.

## Example Request

```http
GET /v1/usage?startDate=2026-03-01&endDate=2026-03-31&mode=gateway
```

Specific timezone mode:

```http
GET /v1/usage?startDate=2026-03-01&endDate=2026-03-31&mode=specific&utcOffset=UTC%2B08:00
```

