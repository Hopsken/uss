import type {
  AgentDetailResponse,
  AgentsListResponse,
  UpdateAgentModelResponse,
} from "@uss/shared";
import { agentsService } from "./agents.service.js";

export const agentsController = {
  getAgents: async (): Promise<AgentsListResponse> => agentsService.loadAgentsList(),
  getAgentDetail: async (agentId: string): Promise<AgentDetailResponse | null> =>
    agentsService.loadAgentDetail(agentId),
  patchAgentModel: async (agentId: string, modelId: string): Promise<UpdateAgentModelResponse> =>
    agentsService.updateAgentModel(agentId, modelId),
};
