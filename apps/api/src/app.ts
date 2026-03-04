import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { v1Plugin } from "./plugins/v1.js";

export function buildApp() {
  return new Elysia({ adapter: node() }).use(errorHandlerPlugin).use(v1Plugin);
}
