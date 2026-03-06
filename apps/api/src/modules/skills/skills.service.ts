import type {
  AssignSkillRequest,
  AssignSkillResponse,
  SaveSkillConfigRequest,
  SaveSkillConfigResponse,
  SkillsResponse,
  ToggleSkillRequest,
  ToggleSkillResponse,
} from "@uss/shared";
import { logger, type Logger } from "../../infra/logging/logger.js";
import {
  skillsGatewayRepository,
  type SkillsGatewayRepository,
} from "./skills.gateway.repository.js";
import {
  buildAgentGroups,
  buildAssignPatch,
  buildSkillsUpdatePayload,
  mapSkillsFromStatus,
  parseAgentsList,
  parseConfigState,
} from "./skills.mapper.js";

type SkillsLogger = Pick<Logger, "error">;

export type SkillsService = {
  loadSkills: () => Promise<SkillsResponse>;
  toggleSkill: (skillId: string, body: ToggleSkillRequest) => Promise<ToggleSkillResponse>;
  saveSkillConfig: (skillId: string, body: SaveSkillConfigRequest) => Promise<SaveSkillConfigResponse>;
  assignSkill: (skillId: string, body: AssignSkillRequest) => Promise<AssignSkillResponse>;
};

export type SkillsServiceDeps = {
  gatewayRepository: SkillsGatewayRepository;
  logger: SkillsLogger;
};

export function createSkillsService(deps: SkillsServiceDeps): SkillsService {
  return {
    async loadSkills(): Promise<SkillsResponse> {
      const syncedAt = new Date().toISOString();

      const [agentsRaw, systemStatusRaw, configSnapshotRaw] = await Promise.all([
        deps.gatewayRepository.fetchAgentsList(),
        deps.gatewayRepository.fetchSkillsStatus(),
        deps.gatewayRepository.fetchConfigSnapshot(),
      ]);

      const agents = parseAgentsList(agentsRaw);
      const configState = parseConfigState(configSnapshotRaw);

      const [systemSkills, agentStatuses] = await Promise.all([
        mapSkillsFromStatus({
          statusRaw: systemStatusRaw,
          config: configState.config,
        }),
        Promise.all(
          agents.map(async (agent) => {
            try {
              const statusRaw = await deps.gatewayRepository.fetchSkillsStatus(agent.id);
              const skills = await mapSkillsFromStatus({
                statusRaw,
                config: configState.config,
              });

              return {
                agentId: agent.id,
                agentName: agent.name,
                skills,
              };
            } catch (error) {
              deps.logger.error({
                agentId: agent.id,
                error,
              }, "Failed to fetch skills for agent");

              return {
                agentId: agent.id,
                agentName: agent.name,
                skills: [],
              };
            }
          }),
        ),
      ]);

      return {
        systemSkills,
        agentGroups: buildAgentGroups({ agentStatuses }),
        syncedAt,
      };
    },

    async toggleSkill(skillId, body): Promise<ToggleSkillResponse> {
      await deps.gatewayRepository.updateSkill({
        skillKey: skillId,
        enabled: body.enabled,
      });

      return {
        ok: true,
        skillId,
        agentId: body.agentId,
        enabled: body.enabled,
        syncedAt: new Date().toISOString(),
      };
    },

    async saveSkillConfig(skillId, body): Promise<SaveSkillConfigResponse> {
      const payload = buildSkillsUpdatePayload(body.config);

      await deps.gatewayRepository.updateSkill({
        skillKey: skillId,
        ...payload,
      });

      return {
        ok: true,
        skillId,
        agentId: body.agentId,
        config: body.config,
        syncedAt: new Date().toISOString(),
      };
    },

    async assignSkill(skillId, body): Promise<AssignSkillResponse> {
      const state = parseConfigState(await deps.gatewayRepository.fetchConfigSnapshot());
      const patch = buildAssignPatch({
        config: state.config,
        skillId,
        sourceAgentId: body.sourceAgentId,
        targetAgentId: body.targetAgentId,
      });

      if (patch.patch) {
        await deps.gatewayRepository.patchConfig(patch.patch, state.baseHash);
      }

      return {
        ok: true,
        skillId,
        sourceAgentId: body.sourceAgentId,
        targetAgentId: body.targetAgentId,
        applied: patch.applied,
        reason: patch.reason,
        syncedAt: new Date().toISOString(),
      };
    },
  };
}

export const skillsService = createSkillsService({
  gatewayRepository: skillsGatewayRepository,
  logger: logger.child({ module: "skills" }),
});
