import test from "node:test";
import assert from "node:assert/strict";
import { Elysia } from "elysia";
import type { SkillsResponse } from "@uss/shared";
import { createSkillsRoutes } from "./skills.routes.js";

const payload: SkillsResponse = {
  systemSkills: [],
  agentGroups: [],
  syncedAt: "2026-03-04T00:00:00.000Z",
};

test("GET /v1/skills returns skills payload", async () => {
  const app = new Elysia({ prefix: "/v1" }).use(
    createSkillsRoutes({
      getSkills: async () => payload,
      patchToggleSkill: async (skillId, body) => ({
        ok: true,
        skillId,
        agentId: body.agentId,
        enabled: body.enabled,
        syncedAt: "2026-03-04T00:00:00.000Z",
      }),
      putSkillConfig: async (skillId, body) => ({
        ok: true,
        skillId,
        agentId: body.agentId,
        config: body.config,
        syncedAt: "2026-03-04T00:00:00.000Z",
      }),
      postAssignSkill: async (skillId, body) => ({
        ok: true,
        skillId,
        sourceAgentId: body.sourceAgentId,
        targetAgentId: body.targetAgentId,
        applied: false,
        reason: "noop",
        syncedAt: "2026-03-04T00:00:00.000Z",
      }),
    }),
  );

  const response = await app.handle(new Request("http://localhost/v1/skills"));
  const body = (await response.json()) as SkillsResponse;

  assert.equal(response.status, 200);
  assert.equal(body.agentGroups.length, 0);
});
