import test from "node:test";
import assert from "node:assert/strict";
import { createSkillsService } from "./skills.service.js";

const logger = {
  error: () => {},
};

test("assignSkill returns noop when target filter is undefined", async () => {
  const service = createSkillsService({
    gatewayRepository: {
      fetchAgentsList: async () => ({ agents: [] }),
      fetchSkillsStatus: async () => ({ skills: [] }),
      updateSkill: async () => ({}),
      fetchConfigSnapshot: async () => ({
        hash: "h1",
        config: {
          agents: {
            list: [
              { id: "a1", skills: ["skill-x"] },
              { id: "a2" },
            ],
          },
        },
      }),
      patchConfig: async () => {
        throw new Error("should not patch");
      },
    },
    logger,
  });

  const result = await service.assignSkill("skill-x", {
    sourceAgentId: "a1",
    targetAgentId: "a2",
  });

  assert.equal(result.applied, false);
  assert.equal(result.reason, "target_filter_undefined_noop");
});

test("assignSkill patches config when both filters explicit", async () => {
  let patchCalled = false;

  const service = createSkillsService({
    gatewayRepository: {
      fetchAgentsList: async () => ({ agents: [] }),
      fetchSkillsStatus: async () => ({ skills: [] }),
      updateSkill: async () => ({}),
      fetchConfigSnapshot: async () => ({
        hash: "h1",
        config: {
          agents: {
            list: [
              { id: "a1", skills: ["skill-x", "skill-y"] },
              { id: "a2", skills: ["skill-z"] },
            ],
          },
        },
      }),
      patchConfig: async () => {
        patchCalled = true;
      },
    },
    logger,
  });

  const result = await service.assignSkill("skill-x", {
    sourceAgentId: "a1",
    targetAgentId: "a2",
  });

  assert.equal(result.applied, true);
  assert.equal(result.reason, null);
  assert.equal(patchCalled, true);
});
