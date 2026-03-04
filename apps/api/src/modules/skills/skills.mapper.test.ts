import test from "node:test";
import assert from "node:assert/strict";
import { buildAssignPatch, buildSkillsUpdatePayload } from "./skills.mapper.js";

test("buildSkillsUpdatePayload maps api key and env fields", () => {
  const mapped = buildSkillsUpdatePayload([
    { key: "api_key", label: "API Key", value: "secret", isSecret: true },
    { key: "env:BRAVE_API_KEY", label: "BRAVE_API_KEY", value: "k", isSecret: true },
    { key: "env:REGION", label: "REGION", value: "us", isSecret: false },
  ]);

  assert.equal(mapped.apiKey, "secret");
  assert.equal(mapped.env?.BRAVE_API_KEY, "k");
  assert.equal(mapped.env?.REGION, "us");
});

test("buildAssignPatch returns noop when no explicit target filter", () => {
  const patch = buildAssignPatch({
    config: {
      agents: {
        list: [
          { id: "a1", skills: ["s1"] },
          { id: "a2" },
        ],
      },
    },
    skillId: "s1",
    sourceAgentId: "a1",
    targetAgentId: "a2",
  });

  assert.equal(patch.applied, false);
  assert.equal(patch.reason, "target_filter_undefined_noop");
  assert.equal(patch.patch, null);
});
