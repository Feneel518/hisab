"use server";

import { prisma } from "@/lib/prisma/db";

export async function getParties(businessId: string) {
  return prisma.party.findMany({
    where: {
      businessId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      kind: true, // CUSTOMER / SUPPLIER etc
    },
    orderBy: { name: "asc" },
  });
}
