"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { Prisma } from "@prisma/client/client";
import { BusinessOnboardingStatus } from "@prisma/client/enums";
import { prisma } from "@/lib/prisma/db";
import {
  businessCreateSchema,
  BusinessCreateSchemaRequest,
} from "@/lib/validators/business/BusinessValidator";
import { redirect } from "next/navigation";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      code?: string;
    };

export const createBusinessAction = async (
  values: BusinessCreateSchemaRequest,
): Promise<ActionResult> => {
  const user = await requireAuth();

  const parsed = businessCreateSchema.safeParse(values);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flat.fieldErrors,
      code: "VALIDATION_ERROR",
    };
  }
  try {
    /* Prevent duplicate business for same user */
    const existingBusiness = await prisma.business.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (existingBusiness) {
      return {
        ok: false,
        message: "Business already exists for this account.",
        code: "BUSINESS_ALREADY_EXISTS",
      };
    }

    // 4) Create business
    await prisma.business.create({
      data: {
        ownerId: user.id,
        name: parsed.data.name,

        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        pincode: parsed.data.pincode,
        email: parsed.data.email,
        phone: parsed.data.phone,
        city: parsed.data.city,
        pan: parsed.data.pan,
        gstin: parsed.data.gstin,

        onboardingStatus: BusinessOnboardingStatus.PARTIES_PENDING,
      },
      select: { id: true },
    });

    return { ok: true };
  } catch (error) {
    // 5) Known DB errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique violation (e.g., race condition on ownerId unique)
      if (error.code === "P2002") {
        return {
          ok: false,
          message: "Business already exists for this account.",
          code: "BUSINESS_ALREADY_EXISTS",
        };
      }
    }

    // 6) Unknown errors (log and return safe message)
    console.error("createBusinessAction failed:", error);

    return {
      ok: false,
      message:
        "Something went wrong while creating the business. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
};
