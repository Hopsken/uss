import test from "node:test";
import assert from "node:assert/strict";
import pino from "pino";
import type { UsageResponse } from "@uss/shared";
import { createUsageService } from "./usage.service.js";

const payload: UsageResponse = {
  startDate: "2026-03-01",
  endDate: "2026-03-03",
  summary: {
    totalCost: 0,
    totalTokens: 0,
    conversationCount: 0,
    taskRunCount: 0,
  },
  timeSeries: [],
  agents: [],
  modelBreakdown: [],
};

const silentLogger = pino({ enabled: false });

test("usage service returns fresh cache hit", async () => {
  let fetchCalls = 0;

  const service = createUsageService({
    gatewayRepository: {
      fetchSessionsUsage: async () => {
        fetchCalls += 1;
        return {};
      },
      fetchAllCronJobs: async () => [],
      fetchAllCronRuns: async () => [],
      fetchAgentsList: async () => ({}),
      fetchModelsList: async () => ({}),
    },
    cacheRepository: {
      loadByKey: async () => ({
        query: {
          startDate: payload.startDate,
          endDate: payload.endDate,
          mode: "gateway",
        },
        payload,
        fetchedAtMs: Date.now(),
        expiresAtMs: Date.now() + 10_000,
        sourceUpdatedAtMs: null,
        rangeDays: 3,
      }),
      save: async () => {},
      pruneBefore: async () => {},
    },
    logger: silentLogger,
  });

  const result = await service.loadUsage({
    startDate: payload.startDate,
    endDate: payload.endDate,
  });

  assert.equal(fetchCalls, 0);
  assert.equal(result.startDate, payload.startDate);
});

test("usage service returns stale cache fallback when live fetch fails", async () => {
  const service = createUsageService({
    gatewayRepository: {
      fetchSessionsUsage: async () => {
        throw new Error("gateway down");
      },
      fetchAllCronJobs: async () => [],
      fetchAllCronRuns: async () => [],
      fetchAgentsList: async () => ({}),
      fetchModelsList: async () => ({}),
    },
    cacheRepository: {
      loadByKey: async () => ({
        query: {
          startDate: payload.startDate,
          endDate: payload.endDate,
          mode: "gateway",
        },
        payload,
        fetchedAtMs: Date.now() - 1000,
        expiresAtMs: Date.now() - 1,
        sourceUpdatedAtMs: null,
        rangeDays: 3,
      }),
      save: async () => {},
      pruneBefore: async () => {},
    },
    logger: silentLogger,
  });

  const result = await service.loadUsage({
    startDate: payload.startDate,
    endDate: payload.endDate,
  });

  assert.equal(result.endDate, payload.endDate);
});
