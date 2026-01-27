"use server";

import { partyCreateSchema } from "@/lib/validators/party/PartyValidator";
import { ActionResult } from "../business/createBusiness";
import { requireBusiness } from "../business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";
import { prismaError } from "../error";

function toFieldErrors(err: unknown): ActionResult {
  return { ok: false, message: "Something went wrong. Please try again." };
}

export async function updateParty(input: unknown): Promise<ActionResult> {
  const business = await requireBusiness();
  const parsed = partyCreateSchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    const flat = parsed.success ? null : parsed.error.flatten();
    return {
      ok: false,
      message: "Fix validation errors.",
      fieldErrors: flat?.fieldErrors,
    };
  }

  const partyId = parsed.data.id;
  if (!partyId) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Party id is required.",
      fieldErrors: { id: ["Party id is required."] },
    };
  }
  try {
    const res = await prisma.party.updateMany({
      where: {
        id: partyId,
        businessId: business.id,
        deletedAt: null, // ✅ block editing deleted parties
      },
      data: {
        name: parsed.data.name.trim(),
        kind: parsed.data.kind,
        phone: parsed.data.phone ?? null,
        gstin: parsed.data.gstin ?? null,
        email: parsed.data.email ?? null,
        pan: parsed.data.pan ?? null,
        city: parsed.data.city ?? null,
        addressLine1: parsed.data.addressLine1 ?? null,
        addressLine2: parsed.data.addressLine2 ?? null,
        pincode: parsed.data.pincode ?? null,
      },
    });

    if (res.count === 1) {
      revalidatePath("/dashboard/parties");
      return { ok: true };
    }

    // If no update: either not found OR deleted
    const exists = await prisma.party.findFirst({
      where: { id: partyId, businessId: business.id },
      select: { deletedAt: true },
    });

    if (!exists)
      return { ok: false, code: "NOT_FOUND", message: "Party not found." };
    if (exists.deletedAt)
      return {
        ok: false,
        code: "DELETED",
        message: "Restore party before editing.",
      };

    return { ok: false, code: "FAILED", message: "Could not update party." };
  } catch (e) {
    return prismaError(e);
  }
}
