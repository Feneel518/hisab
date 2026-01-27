import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Prisma } from "./generated/prisma/client";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z\s'-]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractPanFromGstin(gstin: string): string | null {
  if (!gstin) return null;

  const normalized = gstin.trim().toUpperCase();

  // GSTIN format validation
  // 2 digits + 10 PAN chars + 1 digit + Z + 1 alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  if (!gstinRegex.test(normalized)) {
    return null;
  }

  // PAN is characters 3 to 12 (0-based index: 2 → 11)
  return normalized.substring(2, 12);
}

export function normalizeEmptyStrings<T extends Record<string, any>>(
  obj: T
): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      const t = v.trim();
      out[k] = t.length ? t : undefined;
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      code?:
        | "VALIDATION_ERROR"
        | "NOT_FOUND"
        | "FORBIDDEN"
        | "CONFLICT"
        | "DELETED"
        | "FAILED";
      fieldErrors?: Record<string, string[]>;
    };

export function validationError(err: z.ZodError): ActionResult {
  const flat = err.flatten();
  return {
    ok: false,
    code: "VALIDATION_ERROR",
    message: "Fix validation errors.",
    fieldErrors: flat.fieldErrors,
  };
}
