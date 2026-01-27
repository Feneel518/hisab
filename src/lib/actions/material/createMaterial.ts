"use server";

import {
  materialCreateSchema,
  materialCreateSchemaRequest,
} from "@/lib/validators/material/MaterialValidator";
import { requireBusiness } from "../business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

type ActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      code?: string;
    };

const normalizeName = (name: string) => name.trim();

const parseGstRate = (value: unknown) => {
  if (value === null || value === undefined) return 18;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};
export const createMaterialAction = async (
  values: materialCreateSchemaRequest,
) => {
  const business = await requireBusiness();

  const parsed = materialCreateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
      code: "VALIDATION_ERROR",
    };
  }
  const data = parsed.data;

  try {
    await prisma.material.create({
      data: {
        businessId: business.id,
        name: normalizeName(data.name),
        unit: data.unit,
        gstRate: parseGstRate(data.gstRate),
        hsnCode: data.hsnCode ? data.hsnCode.trim() : null,
      },
    });

    revalidatePath("dashboard/materials");

    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === "P2002") {
        return {
          ok: false,
          message: "Material with this name already exists",
          code: "DUPLICATE",
        };
      }
    }

    return {
      ok: false,
      message: "Failed to create material",
      code: "SERVER_ERROR",
    };
  }
};
