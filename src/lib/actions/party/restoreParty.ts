"use server";

import { prisma } from "@/lib/prisma/db";
import { requireBusiness } from "../business/getBusiness";
import { revalidatePath } from "next/cache";
import { prismaError } from "../error";

export async function restoreParty(partyId: string) {
  const business = await requireBusiness();

  try {
    const res = await prisma.party.updateMany({
      where: {
        id: partyId,
        businessId: business.id,
        deletedAt: { not: null },
      },
      data: {
        deletedAt: null,
        deletedBy: null,
        isActive: true,
      },
    });

    if (res.count === 1) {
      revalidatePath("/dashboard/parties");
      return { ok: true };
    }

    const exists = await prisma.party.findFirst({
      where: { id: partyId, businessId: business.id },
      select: { deletedAt: true },
    });

    if (!exists)
      return { ok: false, code: "NOT_FOUND", message: "Party not found." };

    // Not deleted -> idempotent success
    return { ok: true };
  } catch (e) {
    return prismaError(e);
  }
}
