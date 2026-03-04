import test from "node:test";
import assert from "node:assert/strict";
import { Elysia } from "elysia";
import { createHealthRoutes } from "./health.routes.js";

test("GET /v1/health returns typed health payload", async () => {
  const app = new Elysia({ prefix: "/v1" }).use(createHealthRoutes());

  const response = await app.handle(new Request("http://localhost/v1/health"));
  const payload = (await response.json()) as {
    status: string;
    service: string;
    timestamp: string;
  };

  assert.equal(response.status, 200);
  assert.equal(payload.status, "ok");
  assert.equal(payload.service, "api");
  assert.equal(Number.isNaN(Date.parse(payload.timestamp)), false);
});
