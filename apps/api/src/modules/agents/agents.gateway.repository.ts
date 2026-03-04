import { gatewayClient } from "../../infra/gateway/client.js";
import type { AgentsCoreRaw } from "./agents.model.js";

export type AgentIdentity = {
  agentId: string;
  name: string;
  avatar: string | null;
};

export type AgentFileInfo = {
  name: string;
  missing: boolean;
};

export type AgentsGatewayRepository = {
  fetchCoreRaw: () => Promise<AgentsCoreRaw>;
  fetchAgentIdentity: (agentId: string) => Promise<AgentIdentity | null>;
  fetchAgentFilesList: (agentId: string) => Promise<AgentFileInfo[]>;
  fetchAgentFileContent: (agentId: string, filename: string) => Promise<string | null>;
  fetchSkillsStatus: () => Promise<unknown>;
  fetchSessionsForAgent: (agentId: string) => Promise<unknown>;
  updateAgentModel: (agentId: string, modelId: string) => Promise<void>;
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export const agentsGatewayRepository: AgentsGatewayRepository = {
  async fetchCoreRaw(): Promise<AgentsCoreRaw> {
    await gatewayClient.ensureConnected();

    const [agentsList, status, cronList, cronRuns, modelsList] = await Promise.all([
      gatewayClient.request("agents.list", {}),
      gatewayClient.request("status", {}),
      gatewayClient.request("cron.list", { includeDisabled: true, limit: 200 }),
      gatewayClient.request("cron.runs", { scope: "all", limit: 20, sortDir: "desc" }),
      gatewayClient.request("models.list", {}),
    ]);

    return {
      agentsList,
      status,
      cronList,
      cronRuns,
      modelsList,
    };
  },

  async fetchAgentIdentity(agentId: string): Promise<AgentIdentity | null> {
    const payload = await gatewayClient.request("agent.identity.get", { agentId });
    const obj = asObject(payload);

    if (!obj) {
      return null;
    }

    return {
      agentId,
      name: asString(obj.name) ?? agentId,
      avatar: asString(obj.avatar),
    };
  },

  async fetchAgentFilesList(agentId: string): Promise<AgentFileInfo[]> {
    const payload = await gatewayClient.request("agents.files.list", { agentId });
    const obj = asObject(payload);
    const files = asArray<Record<string, unknown>>(obj?.files);

    return files
      .map((entry) => ({
        name: asString(entry.name),
        missing: Boolean(entry.missing),
      }))
      .filter((entry): entry is AgentFileInfo => Boolean(entry.name));
  },

  async fetchAgentFileContent(agentId: string, filename: string): Promise<string | null> {
    const payload = await gatewayClient.request("agents.files.get", {
      agentId,
      name: filename,
    });

    const obj = asObject(payload);
    const file = asObject(obj?.file);

    return asString(file?.content);
  },

  async fetchSkillsStatus(): Promise<unknown> {
    return gatewayClient.request("skills.status", {});
  },

  async fetchSessionsForAgent(agentId: string): Promise<unknown> {
    return gatewayClient.request("sessions.list", { agentId, limit: 20 });
  },

  async updateAgentModel(agentId: string, modelId: string): Promise<void> {
    await gatewayClient.request("agents.update", {
      agentId,
      model: modelId,
    });
  },
};
