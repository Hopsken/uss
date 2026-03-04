import { t } from "elysia";

export const healthResponseSchema = t.Object({
  status: t.Literal("ok"),
  service: t.Literal("api"),
  timestamp: t.String({ format: "date-time" }),
});
