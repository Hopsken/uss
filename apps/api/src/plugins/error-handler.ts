import { Elysia } from "elysia";

export const errorHandlerPlugin = new Elysia({ name: "error-handler" }).onError(
  ({ code, error, path, set }) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error("[api] request failed", {
      code,
      message,
      path,
    });

    set.status = 500;

    return {
      error: "internal_server_error",
    };
  },
);
