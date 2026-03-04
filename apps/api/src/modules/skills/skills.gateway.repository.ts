import { gatewayClient } from "../../infra/gateway/client.js";

export type SkillsGatewayRepository = {
  fetchAgentsList: () => Promise<unknown>;
  fetchSkillsStatus: (agentId?: string) => Promise<unknown>;
  updateSkill: (params: {
    skillKey: string;
    enabled?: boolean;
    apiKey?: string;
    env?: Record<string, string>;
  }) => Promise<unknown>;
  fetchConfigSnapshot: () => Promise<unknown>;
  patchConfig: (patch: Record<string, unknown>, baseHash?: string | null) => Promise<unknown>;
};

export const skillsGatewayRepository: SkillsGatewayRepository = {
  async fetchAgentsList(): Promise<unknown> {
    await gatewayClient.ensureConnected();
    return gatewayClient.request("agents.list", {});
  },

  async fetchSkillsStatus(agentId?: string): Promise<unknown> {
    await gatewayClient.ensureConnected();

    if (agentId) {
      return gatewayClient.request("skills.status", { agentId });
    }

    return gatewayClient.request("skills.status", {});
  },

  async updateSkill(params): Promise<unknown> {
    await gatewayClient.ensureConnected();

    const payload: Record<string, unknown> = {
      skillKey: params.skillKey,
    };

    if (typeof params.enabled === "boolean") {
      payload.enabled = params.enabled;
    }

    if (typeof params.apiKey === "string") {
      payload.apiKey = params.apiKey;
    }

    if (params.env && Object.keys(params.env).length > 0) {
      payload.env = params.env;
    }

    return gatewayClient.request("skills.update", payload);
  },

  async fetchConfigSnapshot(): Promise<unknown> {
    await gatewayClient.ensureConnected();
    return gatewayClient.request("config.get", {});
  },

  async patchConfig(patch, baseHash): Promise<unknown> {
    await gatewayClient.ensureConnected();

    const payload: Record<string, unknown> = {
      raw: JSON.stringify(patch),
    };

    if (baseHash) {
      payload.baseHash = baseHash;
    }

    return gatewayClient.request("config.patch", payload);
  },
};
