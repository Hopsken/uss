import test from "node:test";
import assert from "node:assert/strict";
import pino from "pino";
import { createBridgeService } from "./bridge.service.js";
import type { BridgeRawPayload } from "./bridge.model.js";
import type { BridgeResponse } from "@uss/shared";

const silentLogger = pino({ enabled: false });

const rawPayload: BridgeRawPayload = {
  hello: { server: { version: "1.0.0" }, snapshot: { uptimeMs: 1000 } },
  agentsList: { agents: [] },
  status: {},
  usageToday: {},
  usageWeek: {},
  usageStatus: { providers: [] },
  cronRuns: { entries: [] },
  cronList: { jobs: [] },
};

const cachedPayload: BridgeResponse = {
  agents: [],
  recentTaskRuns: [],
  systemHealth: {
    openclaw: { status: "running", uptimeSeconds: 1, version: "cache" },
    providers: [],
    recentErrors: [],
  },
  usageSnapshot: {
    today: { costUsd: 1, tokens: 2, conversations: 3 },
    thisWeek: { costUsd: 4, tokens: 5, conversations: 6 },
  },
};

test("bridge service returns live payload and saves snapshot", async () => {
  let saveCalled = false;
  const service = createBridgeService({
    gatewayRepository: {
      fetchBridgeRaw: async () => rawPayload,
    },
    snapshotRepository: {
      saveSnapshot: async () => {
        saveCalled = true;
      },
      loadSnapshot: async () => null,
    },
    gatewayUrl: "ws://localhost:18789",
    logger: silentLogger,
  });

  const result = await service.loadBridgeData();

  assert.equal(saveCalled, true);
  assert.equal(result.systemHealth.openclaw.version, "1.0.0");
});

test("bridge service returns cached snapshot when gateway fails", async () => {
  const service = createBridgeService({
    gatewayRepository: {
      fetchBridgeRaw: async () => {
        throw new Error("offline");
      },
    },
    snapshotRepository: {
      saveSnapshot: async () => {},
      loadSnapshot: async () => cachedPayload,
    },
    gatewayUrl: "ws://localhost:18789",
    logger: silentLogger,
  });

  const result = await service.loadBridgeData();
  assert.equal(result.systemHealth.openclaw.version, "cache");
});

test("bridge service returns degraded response when gateway and cache fail", async () => {
  const service = createBridgeService({
    gatewayRepository: {
      fetchBridgeRaw: async () => {
        throw new Error("offline");
      },
    },
    snapshotRepository: {
      saveSnapshot: async () => {},
      loadSnapshot: async () => null,
    },
    gatewayUrl: "ws://localhost:18789",
    logger: silentLogger,
  });

  const result = await service.loadBridgeData();
  assert.equal(result.systemHealth.openclaw.status, "error");
  assert.equal(result.systemHealth.recentErrors.length, 1);
});
