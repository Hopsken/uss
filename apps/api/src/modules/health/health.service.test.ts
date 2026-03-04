import test from "node:test";
import assert from "node:assert/strict";
import { createHealthPayload } from "./health.service.js";

test("createHealthPayload returns api health payload", () => {
  const payload = createHealthPayload();

  assert.equal(payload.status, "ok");
  assert.equal(payload.service, "api");
  assert.equal(typeof payload.timestamp, "string");
  assert.equal(Number.isNaN(Date.parse(payload.timestamp)), false);
});
