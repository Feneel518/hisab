"use server";

import {
  materialCreateSchema,
  materialCreateSchemaRequest,
} from "@/lib/validators/material/MaterialValidator";
import { requireBusiness } from "../business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

const normalizeName = (name: string) => name.trim();

const parseGstRate = (value: unknown) => {
  if (value === null || value === undefined) return 18;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};
export const updateMaterialAction = async (
  values: materialCreateSchemaRequest
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

  if (!data.id) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Material id is required.",
      fieldErrors: { id: ["Material id is required."] },
    };
  }

  try {
    // Ensure material belongs to business
    const existing = await prisma.material.findFirst({
      where: {
        id: data.id,
        businessId: business.id,
      },
      select: { id: true },
    });

    if (!existing)
      return { ok: false, message: "Material not found", code: "NOT_FOUND" };
    await prisma.material.update({
      where: { id: existing.id },
      data: {
        name: normalizeName(data.name),
        gstRate: data.gstRate,
        hsnCode: data.hsnCode ? data.hsnCode.trim() : null,
        unit: data.unit,
      },
    });

    revalidatePath("/dashboard/materials");
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
