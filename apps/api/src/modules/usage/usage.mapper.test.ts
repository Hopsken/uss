import test from "node:test";
import assert from "node:assert/strict";
import { mapUsagePayload } from "./usage.mapper.js";

test("mapUsagePayload maps summary and breakdowns", () => {
  const mapped = mapUsagePayload({
    query: {
      startDate: "2026-03-01",
      endDate: "2026-03-03",
      mode: "gateway",
    },
    raw: {
      sessionsUsage: {
        updatedAt: 123,
        sessions: [
          { key: "agent:a1:s1", modelProvider: "openai", model: "gpt-5" },
          { key: "agent:a1:s2", modelProvider: "openai", model: "gpt-5" },
        ],
        totals: {
          totalCost: 9.5,
          totalTokens: 1500,
        },
        aggregates: {
          daily: [{ date: "2026-03-02", cost: 4, tokens: 1000 }],
          byAgent: [{ agentId: "a1", totals: { totalCost: 9.5, totalTokens: 1500 } }],
          byModel: [{ provider: "openai", model: "gpt-5", totals: { totalCost: 9.5, totalTokens: 1500 } }],
        },
      },
      cronJobs: [{ id: "job1", agentId: "a1", payload: { model: "openai/gpt-5" } }],
      cronRuns: [{ jobId: "job1", runAtMs: Date.UTC(2026, 2, 2, 12), model: "gpt-5", provider: "openai" }],
      agentsList: { agents: [{ id: "a1", name: "Alpha" }] },
      modelsList: { models: [{ id: "gpt-5", provider: "openai", name: "GPT-5" }] },
    },
  });

  assert.equal(mapped.payload.summary.totalCost, 9.5);
  assert.equal(mapped.payload.summary.totalTokens, 1500);
  assert.equal(mapped.payload.summary.conversationCount, 2);
  assert.equal(mapped.payload.summary.taskRunCount, 1);
  assert.equal(mapped.payload.timeSeries.length, 3);
  assert.equal(mapped.payload.timeSeries[0]?.date, "2026-03-01");
  assert.equal(mapped.payload.timeSeries[1]?.cost, 4);
  assert.equal(mapped.payload.agents[0]?.agentName, "Alpha");
  assert.equal(mapped.payload.agents[0]?.taskRunCount, 1);
  assert.equal(mapped.payload.modelBreakdown[0]?.modelName, "GPT-5");
  assert.equal(mapped.sourceUpdatedAtMs, 123);
});

test("mapUsagePayload returns empty timeSeries when daily is empty", () => {
  const mapped = mapUsagePayload({
    query: {
      startDate: "2026-03-01",
      endDate: "2026-03-03",
      mode: "gateway",
    },
    raw: {
      sessionsUsage: {
        sessions: [],
        totals: {},
        aggregates: {
          daily: [],
          byAgent: [],
          byModel: [],
        },
      },
      cronJobs: [],
      cronRuns: [],
      agentsList: { agents: [] },
      modelsList: { models: [] },
    },
  });

  assert.equal(mapped.payload.timeSeries.length, 0);
});
