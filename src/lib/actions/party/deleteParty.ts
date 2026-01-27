"use server";

import { prisma } from "@/lib/prisma/db";
import { requireBusiness } from "../business/getBusiness";
import { revalidatePath } from "next/cache";
import { prismaError } from "../error";


export async function softDeleteParty(partyId: string) {
  const business = await requireBusiness();
  const user = business.ownerId; // you can call requireAuth() if you prefer
  try {
    const res = await prisma.party.updateMany({
      where: {
        id: partyId,
        businessId: business.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: business.ownerId, // ok for MVP
        isActive: false,
      },
    });

    // updateMany returns { count }
    // If count=1 -> deleted now
    // If count=0 -> either not found, not in business, or already deleted
    if (res.count === 1) {
      revalidatePath("/dashboard/parties");
      return { ok: true };
    }

    // Determine if "already deleted" vs "not found"
    const exists = await prisma.party.findFirst({
      where: { id: partyId, businessId: business.id },
      select: { deletedAt: true },
    });

    if (!exists)
      return { ok: false, code: "NOT_FOUND", message: "Party not found." };

    // already deleted -> idempotent success
    return { ok: true };
  } catch (e) {
    return prismaError(e);
  }
}
