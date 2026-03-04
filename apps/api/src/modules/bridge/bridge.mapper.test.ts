import test from "node:test";
import assert from "node:assert/strict";
import { mapBridgePayload, createDegradedBridgeResponse } from "./bridge.mapper.js";
import type { BridgeRawPayload } from "./bridge.model.js";

test("mapBridgePayload maps core gateway payload", () => {
  const raw: BridgeRawPayload = {
    hello: { server: { version: "1.2.3" }, snapshot: { uptimeMs: 12_000 } },
    agentsList: {
      agents: [
        {
          id: "a1",
          name: "Agent 1",
          identity: { avatarUrl: "https://example.com/a1.png" },
        },
      ],
    },
    status: {
      sessions: {
        byAgent: [
          {
            agentId: "a1",
            recent: [{ updatedAt: Date.now(), model: "gpt-4.1", flags: [] }],
          },
        ],
        recent: [{ modelProvider: "openai", model: "gpt-4.1" }],
      },
    },
    usageToday: { totals: { totalCost: 1.5, totalTokens: 100 }, sessions: [{}] },
    usageWeek: { totals: { totalCost: 3.2, totalTokens: 250 }, sessions: [{}, {}] },
    usageStatus: {
      providers: [{ provider: "openai", displayName: "OpenAI", windows: [{}] }],
    },
    cronRuns: {
      entries: [
        {
          jobId: "j1",
          jobName: "Nightly",
          runAtMs: Date.now() - 5000,
          durationMs: 2000,
          status: "ok",
        },
      ],
    },
    cronList: { jobs: [{ id: "j1", agentId: "a1", name: "Nightly", state: {} }] },
  };

  const mapped = mapBridgePayload(raw);

  assert.equal(mapped.systemHealth.openclaw.version, "1.2.3");
  assert.equal(mapped.agents.length, 1);
  assert.equal(mapped.recentTaskRuns.length, 1);
  assert.equal(mapped.usageSnapshot.today.tokens, 100);
});

test("createDegradedBridgeResponse returns zeroed fallback", () => {
  const fallback = createDegradedBridgeResponse("gateway down");

  assert.equal(fallback.agents.length, 0);
  assert.equal(fallback.systemHealth.openclaw.status, "error");
  assert.equal(fallback.usageSnapshot.today.costUsd, 0);
  assert.equal(fallback.systemHealth.recentErrors.length, 1);
});
