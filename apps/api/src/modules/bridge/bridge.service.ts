import type { BridgeResponse } from "@uss/shared";
import { resolveApiEnv } from "../../config/env.js";
import { logger, type Logger } from "../../infra/logging/logger.js";
import { mapBridgePayload, createDegradedBridgeResponse } from "./bridge.mapper.js";
import {
  bridgeGatewayRepository,
  type BridgeGatewayRepository,
} from "./bridge.gateway.repository.js";
import {
  bridgeSnapshotRepository,
  type BridgeSnapshotRepository,
} from "./bridge.snapshot.repository.js";

export type BridgeService = {
  loadBridgeData: () => Promise<BridgeResponse>;
};

type BridgeLogger = Pick<Logger, "error" | "warn">;

export type BridgeServiceDeps = {
  gatewayRepository: BridgeGatewayRepository;
  snapshotRepository: BridgeSnapshotRepository;
  gatewayUrl: string;
  logger: BridgeLogger;
};

export function createBridgeService(deps: BridgeServiceDeps): BridgeService {
  return {
    async loadBridgeData(): Promise<BridgeResponse> {
      try {
        const gatewayRaw = await deps.gatewayRepository.fetchBridgeRaw();
        const payload = mapBridgePayload(gatewayRaw);

        await deps.snapshotRepository.saveSnapshot({
          payload,
          source: "gateway",
          gatewayUrl: deps.gatewayUrl,
        });

        return payload;
      } catch (gatewayError) {
        deps.logger.error({ error: gatewayError }, "Gateway fetch failed");
      }

      const snapshot = await deps.snapshotRepository.loadSnapshot();
      if (snapshot) {
        return snapshot;
      }

      deps.logger.warn("Gateway and snapshot unavailable, returning degraded response");
      return createDegradedBridgeResponse(
        "OpenClaw gateway unavailable and no cached bridge snapshot found",
      );
    },
  };
}

const env = resolveApiEnv();

export const bridgeService = createBridgeService({
  gatewayRepository: bridgeGatewayRepository,
  snapshotRepository: bridgeSnapshotRepository,
  gatewayUrl: env.gatewayUrl,
  logger: logger.child({ module: "bridge" }),
});
