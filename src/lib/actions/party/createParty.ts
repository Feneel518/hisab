"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { Prisma } from "@prisma/client";
import { BusinessOnboardingStatus, PartyKind } from "@prisma/client";
import { prisma } from "@/lib/prisma/db";
import {
  partyCreateSchema,
  PartyCreateSchemaRequest,
} from "@/lib/validators/party/PartyValidator";

export const createPartyAction = async (values: PartyCreateSchemaRequest) => {
  const user = await requireAuth();

  const parsed = partyCreateSchema.safeParse(values);
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
    const business = await prisma.business.findUnique({
      where: { ownerId: user.id },
      select: { id: true, onboardingStatus: true },
    });

    if (!business) {
      return {
        ok: false,
        message: "Business not found. Please complete business setup first.",
        code: "BUSINESS_NOT_FOUND",
      };
    }

    await prisma.party.create({
      data: {
        businessId: business.id,
        name: parsed.data.name,
        kind: parsed.data.kind ?? PartyKind.CUSTOMER,

        phone: parsed.data.phone,
        email: parsed.data.email,
        gstin: parsed.data.gstin,
        pan: parsed.data.pan,

        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        pincode: parsed.data.pincode,
        city: parsed.data.city,

        isActive: true,
      },
      select: { id: true },
    });

    // Move onboarding forward
    await prisma.business.update({
      where: { id: business.id },
      data: {
        onboardingStatus: BusinessOnboardingStatus.COMPLETED,
        onboardingCompletedAt: new Date(),
      },
    });

    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Add any special cases you need later
    }

    console.error("createFirstPartyAction failed:", err);

    return {
      ok: false,
      message: "Unable to create party right now. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
};
