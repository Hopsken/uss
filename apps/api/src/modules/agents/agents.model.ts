import { t } from "elysia";

const agentStatusSchema = t.Union([
  t.Literal("idle"),
  t.Literal("busy"),
  t.Literal("error"),
]);

const agentModelSchema = t.Object({
  id: t.String(),
  name: t.String(),
});

const agentTaskStatusSchema = t.Union([
  t.Literal("running"),
  t.Literal("completed"),
  t.Literal("failed"),
  t.Literal("scheduled"),
]);

export const agentsListResponseSchema = t.Object({
  agents: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      role: t.String(),
      status: agentStatusSchema,
      model: agentModelSchema,
    }),
  ),
  availableModels: t.Array(agentModelSchema),
  syncedAt: t.String({ format: "date-time" }),
});

export const agentDetailResponseSchema = t.Object({
  agent: t.Object({
    id: t.String(),
    name: t.String(),
    role: t.String(),
    status: agentStatusSchema,
    model: agentModelSchema,
    usageSummary: t.Object({
      tokens: t.Number(),
      costUsd: t.Number(),
      conversations: t.Number(),
    }),
    recentTasks: t.Array(
      t.Object({
        id: t.String(),
        title: t.String(),
        status: agentTaskStatusSchema,
        ranAt: t.String({ format: "date-time" }),
      }),
    ),
    skills: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        enabled: t.Boolean(),
      }),
    ),
    configDocs: t.Array(
      t.Object({
        filename: t.String(),
        content: t.String(),
      }),
    ),
  }),
  availableModels: t.Array(agentModelSchema),
  syncedAt: t.String({ format: "date-time" }),
});

export const updateAgentModelBodySchema = t.Object({
  modelId: t.String({ minLength: 1 }),
});

export const updateAgentModelResponseSchema = t.Object({
  ok: t.Literal(true),
  agentId: t.String(),
  modelId: t.String(),
  syncedAt: t.String({ format: "date-time" }),
});

export type JsonObject = Record<string, unknown>;

export type AgentsCoreRaw = {
  agentsList: unknown;
  status: unknown;
  cronList: unknown;
  cronRuns: unknown;
  modelsList: unknown;
};
