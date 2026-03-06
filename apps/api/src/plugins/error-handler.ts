import { Elysia } from "elysia";
import { getRequestLogger } from "./request-logger.js";

export const errorHandlerPlugin = new Elysia({ name: "error-handler" }).onError(
  ({ code, error, path, request, set }: any) => {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      typeof set.status === "number" && set.status >= 400
        ? set.status
        : code === "VALIDATION"
          ? 400
          : code === "NOT_FOUND"
            ? 404
            : 500;

    getRequestLogger(request).error({
      code,
      status,
      message,
      path,
      method: request.method,
      error,
    }, "request.failed");

    set.status = status;

    if (status !== 500) {
      return {
        error: message,
      };
    }

    return {
      error: "internal_server_error",
    };
  },
);
