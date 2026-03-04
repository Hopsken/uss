import test from "node:test";
import assert from "node:assert/strict";
import { Elysia } from "elysia";
import { createBridgeRoutes } from "./bridge.routes.js";
import type { BridgeResponse } from "@uss/shared";

const degraded: BridgeResponse = {
  agents: [],
  recentTaskRuns: [],
  systemHealth: {
    openclaw: {
      status: "error",
      uptimeSeconds: 0,
      version: "unknown",
    },
    providers: [],
    recentErrors: [
      {
        id: "e1",
        level: "warning",
        message: "degraded",
        agentId: null,
        agentName: null,
        taskName: null,
        occurredAt: new Date().toISOString(),
      },
    ],
  },
  usageSnapshot: {
    today: {
      costUsd: 0,
      tokens: 0,
      conversations: 0,
    },
    thisWeek: {
      costUsd: 0,
      tokens: 0,
      conversations: 0,
    },
  },
};

test("GET /v1/bridge returns typed bridge payload", async () => {
  const app = new Elysia({ prefix: "/v1" }).use(
    createBridgeRoutes({
      getBridge: async () => degraded,
    }),
  );

  const response = await app.handle(new Request("http://localhost/v1/bridge"));
  const payload = (await response.json()) as BridgeResponse;

  assert.equal(response.status, 200);
  assert.equal(payload.systemHealth.openclaw.status, "error");
  assert.equal(payload.usageSnapshot.today.costUsd, 0);
});
