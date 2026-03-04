import type { BridgeRawPayload } from "./bridge.model.js";
import { gatewayClient } from "../../infra/gateway/client.js";

export type BridgeGatewayRepository = {
  fetchBridgeRaw: () => Promise<BridgeRawPayload>;
};

export const bridgeGatewayRepository: BridgeGatewayRepository = {
  async fetchBridgeRaw(): Promise<BridgeRawPayload> {
    await gatewayClient.ensureConnected();

    const [agentsList, status, usageToday, usageWeek, usageStatus, cronRuns, cronList] =
      await Promise.all([
        gatewayClient.request("agents.list", {}),
        gatewayClient.request("status", {}),
        gatewayClient.request("usage.cost", { days: 1, mode: "utc" }),
        gatewayClient.request("usage.cost", { days: 7, mode: "utc" }),
        gatewayClient.request("usage.status", {}),
        gatewayClient.request("cron.runs", { scope: "all", limit: 8, sortDir: "desc" }),
        gatewayClient.request("cron.list", { includeDisabled: true, limit: 200 }),
      ]);

    return {
      hello: gatewayClient.helloPayload,
      agentsList,
      status,
      usageToday,
      usageWeek,
      usageStatus,
      cronRuns,
      cronList,
    };
  },
};
