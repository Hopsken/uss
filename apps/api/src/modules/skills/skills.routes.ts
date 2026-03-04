import { Elysia, t } from "elysia";
import type {
  AssignSkillRequest,
  AssignSkillResponse,
  SaveSkillConfigRequest,
  SaveSkillConfigResponse,
  SkillsResponse,
  ToggleSkillRequest,
  ToggleSkillResponse,
} from "@uss/shared";
import { skillsController } from "./skills.controller.js";
import {
  assignSkillBodySchema,
  assignSkillResponseSchema,
  saveSkillConfigBodySchema,
  saveSkillConfigResponseSchema,
  skillsResponseSchema,
  toggleSkillBodySchema,
  toggleSkillResponseSchema,
} from "./skills.model.js";

type SkillsRouteController = {
  getSkills: () => Promise<SkillsResponse>;
  patchToggleSkill: (skillId: string, body: ToggleSkillRequest) => Promise<ToggleSkillResponse>;
  putSkillConfig: (skillId: string, body: SaveSkillConfigRequest) => Promise<SaveSkillConfigResponse>;
  postAssignSkill: (skillId: string, body: AssignSkillRequest) => Promise<AssignSkillResponse>;
};

const skillIdParamSchema = t.Object({
  skillId: t.String({ minLength: 1 }),
});

export function createSkillsRoutes(controller: SkillsRouteController = skillsController) {
  return new Elysia({ name: "skills-routes" })
    .get("/skills", async () => controller.getSkills(), {
      response: skillsResponseSchema,
    })
    .patch(
      "/skills/:skillId/toggle",
      async ({ params, body }) => controller.patchToggleSkill(params.skillId, body),
      {
        params: skillIdParamSchema,
        body: toggleSkillBodySchema,
        response: toggleSkillResponseSchema,
      },
    )
    .put(
      "/skills/:skillId/config",
      async ({ params, body }) => controller.putSkillConfig(params.skillId, body),
      {
        params: skillIdParamSchema,
        body: saveSkillConfigBodySchema,
        response: saveSkillConfigResponseSchema,
      },
    )
    .post(
      "/skills/:skillId/assign",
      async ({ params, body }) => controller.postAssignSkill(params.skillId, body),
      {
        params: skillIdParamSchema,
        body: assignSkillBodySchema,
        response: assignSkillResponseSchema,
      },
    );
}

export const skillsRoutes = createSkillsRoutes();
