import { Elysia } from "elysia";
import type { BridgeResponse } from "@uss/shared";
import { bridgeController } from "./bridge.controller.js";
import { bridgeResponseSchema } from "./bridge.model.js";

type BridgeRouteController = {
  getBridge: () => Promise<BridgeResponse>;
};

export function createBridgeRoutes(controller: BridgeRouteController = bridgeController) {
  return new Elysia({ name: "bridge-routes" }).get(
    "/bridge",
    async () => await controller.getBridge(),
    {
      response: bridgeResponseSchema,
    },
  );
}

export const bridgeRoutes = createBridgeRoutes();
