import type {
  AssignSkillRequest,
  AssignSkillResponse,
  SaveSkillConfigRequest,
  SaveSkillConfigResponse,
  SkillsResponse,
  ToggleSkillRequest,
  ToggleSkillResponse,
} from "@uss/shared";
import { skillsService } from "./skills.service.js";

export const skillsController = {
  getSkills: async (): Promise<SkillsResponse> => await skillsService.loadSkills(),
  patchToggleSkill: async (skillId: string, body: ToggleSkillRequest): Promise<ToggleSkillResponse> =>
    await skillsService.toggleSkill(skillId, body),
  putSkillConfig: async (skillId: string, body: SaveSkillConfigRequest): Promise<SaveSkillConfigResponse> =>
    await skillsService.saveSkillConfig(skillId, body),
  postAssignSkill: async (skillId: string, body: AssignSkillRequest): Promise<AssignSkillResponse> =>
    await skillsService.assignSkill(skillId, body),
};
