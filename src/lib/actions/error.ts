import "server-only";

import { Prisma } from "../generated/prisma/client";
import { ActionResult } from "../utils";

export function prismaError(e: unknown): ActionResult {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint
    if (e.code === "P2002") {
      return {
        ok: false,
        code: "CONFLICT",
        message: "Duplicate value. Please use a different value.",
      };
    }

    // Record not found (rare if we use updateMany guards)
    if (e.code === "P2025") {
      return { ok: false, code: "NOT_FOUND", message: "Record not found." };
    }
  }

  return {
    ok: false,
    code: "FAILED",
    message: "Something went wrong. Please try again.",
  };
}
