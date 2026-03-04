# How To Find Gateway Event Definitions In OpenClaw

This is the workflow used from `uss` to locate authoritative Gateway event/method definitions in the upstream OpenClaw repo.

## Repo Location

- Upstream source repo: `/Users/shaowei/Projects/openclaw/openclaw`
- USS repo (this project): `/Users/shaowei/Projects/openclaw/uss`

## Fast Workflow

1. Find canonical method and event registries.
2. Find WebSocket frame types.
3. Find where events are emitted.
4. Find where `uss` consumes those methods/events.
5. Cross-check with tests.

## Commands Used

From `uss` repo root:

```bash
# 1) Find gateway method/event registry files
rg -n "server-methods-list|GATEWAY_EVENTS|listGatewayMethods" \
  /Users/shaowei/Projects/openclaw/openclaw/src/gateway -S

# 2) Find event/frame type definitions
rg -n "type:\\s*\"event\"|GatewayEventFrame|connect.challenge" \
  /Users/shaowei/Projects/openclaw/openclaw/src/gateway -S

# 3) Find emit points for events
rg -n "event:\\s*\"connect.challenge\"|type:\\s*\"event\"" \
  /Users/shaowei/Projects/openclaw/openclaw/src/gateway -S

# 4) Find specific methods used by USS usage dashboard
rg -n "sessions\\.usage|cron\\.list|cron\\.runs|agents\\.list|models\\.list" \
  apps/api/src/modules/usage -S
```

## Source Of Truth Files In OpenClaw

- `src/gateway/server-methods-list.ts`
  - Enumerates gateway methods
  - Contains `GATEWAY_EVENTS` list (example: `connect.challenge`)
- `src/gateway/server-methods.ts`
  - Composes handlers by domain (sessions, cron, agents, models, usage, etc.)
- `src/gateway/server/ws-connection.ts`
  - Emits handshake event frames like `connect.challenge`
- `src/gateway/client.ts`
  - Client-side handling of event frames

## How USS Maps It

In this repo:

- `apps/api/src/modules/usage/usage.gateway.repository.ts`
  - Calls gateway methods: `sessions.usage`, `cron.list`, `cron.runs`, `agents.list`, `models.list`
- `packages/gateway-client/src/types.ts`
  - Defines frame contracts used by USS (`req`, `res`, `event`)
- `packages/gateway-client/src/client.ts`
  - Handles `connect.challenge` during WS connect flow

## Validation Checklist

- Method exists in OpenClaw registry (`server-methods-list.ts`)
- Method wired in handler composition (`server-methods.ts`)
- Event exists in `GATEWAY_EVENTS` and/or emit location in WS server code
- USS callsites match method names exactly
- Tests mention same event/method names (search in `src/gateway/*.test.ts`)

