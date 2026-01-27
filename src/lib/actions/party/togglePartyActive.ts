"use server";

import { prisma } from "@/lib/prisma/db";
import { ActionResult } from "../business/createBusiness";
import { requireBusiness } from "../business/getBusiness";
import { revalidatePath } from "next/cache";
import { prismaError } from "../error";

export async function togglePartyActive(
  partyId: string
): Promise<ActionResult> {
  const business = await requireBusiness();

  try {
    // Read minimal state (still needed to invert)
    const party = await prisma.party.findFirst({
      where: { id: partyId, businessId: business.id },
      select: { isActive: true, deletedAt: true },
    });

    if (!party)
      return { ok: false, code: "NOT_FOUND", message: "Party not found." };

    if (party.deletedAt) {
      return {
        ok: false,
        code: "DELETED",
        message: "Restore party before changing status.",
      };
    }

    // Atomic write guard ensures it is still not deleted
    const res = await prisma.party.updateMany({
      where: {
        id: partyId,
        businessId: business.id,
        deletedAt: null,
      },
      data: { isActive: !party.isActive },
    });

    if (res.count !== 1) {
      return {
        ok: false,
        code: "FAILED",
        message: "Could not update party status.",
      };
    }

    revalidatePath("/dashboard/parties");
    return { ok: true };
  } catch (e) {
    return prismaError(e);
  }
}
