import type {
  AgentDetailResponse,
  AgentsListResponse,
  UpdateAgentModelResponse,
} from "@uss/shared";
import {
  agentsGatewayRepository,
  type AgentFileInfo,
  type AgentsGatewayRepository,
} from "./agents.gateway.repository.js";
import {
  extractRoleFromDocs,
  mapAgentDetailResponse,
  mapAgentsListResponse,
} from "./agents.mapper.js";

type Logger = Pick<Console, "error">;

export type AgentsService = {
  loadAgentsList: () => Promise<AgentsListResponse>;
  loadAgentDetail: (agentId: string) => Promise<AgentDetailResponse | null>;
  updateAgentModel: (agentId: string, modelId: string) => Promise<UpdateAgentModelResponse>;
};

export type AgentsServiceDeps = {
  gatewayRepository: AgentsGatewayRepository;
  logger: Logger;
};

const ROLE_FILES = ["IDENTITY.md", "AGENTS.md"] as const;
const PRIORITY_FILES = [
  "AGENTS.md",
  "SOUL.md",
  "TOOLS.md",
  "IDENTITY.md",
  "USER.md",
  "HEARTBEAT.md",
  "BOOTSTRAP.md",
  "MEMORY.md",
] as const;

function prioritizeFiles(files: AgentFileInfo[]): AgentFileInfo[] {
  return files.slice().sort((a, b) => {
    const ai = PRIORITY_FILES.indexOf(a.name as (typeof PRIORITY_FILES)[number]);
    const bi = PRIORITY_FILES.indexOf(b.name as (typeof PRIORITY_FILES)[number]);

    if (ai === -1 && bi === -1) {
      return a.name.localeCompare(b.name);
    }

    if (ai === -1) {
      return 1;
    }

    if (bi === -1) {
      return -1;
    }

    return ai - bi;
  });
}

export function createAgentsService(deps: AgentsServiceDeps): AgentsService {
  return {
    async loadAgentsList(): Promise<AgentsListResponse> {
      const syncedAt = new Date().toISOString();
      const coreRaw = await deps.gatewayRepository.fetchCoreRaw();
      const agentsRaw = (coreRaw.agentsList as { agents?: Array<{ id?: string }> })?.agents ?? [];
      const agentIds = agentsRaw
        .map((agent) => (typeof agent.id === "string" ? agent.id : null))
        .filter((id): id is string => id !== null);

      const identityEntries = await Promise.all(
        agentIds.map(async (agentId) => {
          try {
            const identity = await deps.gatewayRepository.fetchAgentIdentity(agentId);
            return [agentId, identity] as const;
          } catch (error) {
            deps.logger.error("Failed to fetch agent identity", { agentId, error });
            return [agentId, null] as const;
          }
        }),
      );

      const identitiesByAgent = new Map(identityEntries);
      const rolesByAgent = new Map<string, string>();

      await Promise.all(
        agentIds.map(async (agentId) => {
          try {
            const files = await deps.gatewayRepository.fetchAgentFilesList(agentId);
            const docs = new Map<string, string>();
            await Promise.all(
              ROLE_FILES.map(async (fileName) => {
                if (!files.some((file) => file.name === fileName && !file.missing)) {
                  return;
                }

                const content = await deps.gatewayRepository.fetchAgentFileContent(agentId, fileName);
                if (content) {
                  docs.set(fileName, content);
                }
              }),
            );

            const role = extractRoleFromDocs({
              identityDoc: docs.get("IDENTITY.md") ?? null,
              agentsDoc: docs.get("AGENTS.md") ?? null,
            });

            if (role) {
              rolesByAgent.set(agentId, role);
            }
          } catch (error) {
            deps.logger.error("Failed to derive role from docs", { agentId, error });
          }
        }),
      );

      return mapAgentsListResponse({
        coreRaw,
        identitiesByAgent,
        rolesByAgent,
        syncedAt,
      });
    },

    async loadAgentDetail(agentId: string): Promise<AgentDetailResponse | null> {
      const syncedAt = new Date().toISOString();
      const [listResponse, coreRaw, files, skillsStatusRaw, sessionsRaw] = await Promise.all([
        this.loadAgentsList(),
        deps.gatewayRepository.fetchCoreRaw(),
        deps.gatewayRepository.fetchAgentFilesList(agentId),
        deps.gatewayRepository.fetchSkillsStatus(),
        deps.gatewayRepository.fetchSessionsForAgent(agentId),
      ]);

      const listItem = listResponse.agents.find((agent) => agent.id === agentId);
      if (!listItem) {
        return null;
      }

      const sortedFiles = prioritizeFiles(files.filter((file) => !file.missing));
      const docsByName = new Map<string, string>();

      await Promise.all(
        sortedFiles.map(async (file) => {
          try {
            const content = await deps.gatewayRepository.fetchAgentFileContent(agentId, file.name);
            if (content !== null) {
              docsByName.set(file.name, content);
            }
          } catch (error) {
            deps.logger.error("Failed to fetch config doc", {
              agentId,
              filename: file.name,
              error,
            });
          }
        }),
      );

      return {
        agent: mapAgentDetailResponse({
          coreRaw,
          listItem,
          docsByName,
          files: sortedFiles,
          sessionsRaw,
          skillsStatusRaw,
        }),
        availableModels: listResponse.availableModels,
        syncedAt,
      };
    },

    async updateAgentModel(agentId: string, modelId: string): Promise<UpdateAgentModelResponse> {
      await deps.gatewayRepository.updateAgentModel(agentId, modelId);

      return {
        ok: true,
        agentId,
        modelId,
        syncedAt: new Date().toISOString(),
      };
    },
  };
}

export const agentsService = createAgentsService({
  gatewayRepository: agentsGatewayRepository,
  logger: console,
});
