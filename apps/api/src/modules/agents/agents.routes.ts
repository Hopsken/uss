import { Elysia, t } from "elysia";
import type {
  AgentDetailResponse,
  AgentsListResponse,
  UpdateAgentModelResponse,
} from "@uss/shared";
import { agentsController } from "./agents.controller.js";
import {
  agentDetailResponseSchema,
  agentsListResponseSchema,
  updateAgentModelBodySchema,
  updateAgentModelResponseSchema,
} from "./agents.model.js";

type AgentsRouteController = {
  getAgents: () => Promise<AgentsListResponse>;
  getAgentDetail: (agentId: string) => Promise<AgentDetailResponse | null>;
  patchAgentModel: (agentId: string, modelId: string) => Promise<UpdateAgentModelResponse>;
};

export function createAgentsRoutes(controller: AgentsRouteController = agentsController) {
  return new Elysia({ name: "agents-routes" })
    .get("/agents", async () => controller.getAgents(), {
      response: agentsListResponseSchema,
    })
    .get(
      "/agents/:agentId",
      async ({ params, set }) => {
        const payload = await controller.getAgentDetail(params.agentId);

        if (!payload) {
          set.status = 404;
          return { error: "not_found" };
        }

        return payload;
      },
      {
        params: t.Object({
          agentId: t.String({ minLength: 1 }),
        }),
        response: {
          200: agentDetailResponseSchema,
          404: t.Object({ error: t.Literal("not_found") }),
        },
      },
    )
    .patch(
      "/agents/:agentId/model",
      async ({ params, body }) => controller.patchAgentModel(params.agentId, body.modelId),
      {
        params: t.Object({
          agentId: t.String({ minLength: 1 }),
        }),
        body: updateAgentModelBodySchema,
        response: updateAgentModelResponseSchema,
      },
    );
}

export const agentsRoutes = createAgentsRoutes();
