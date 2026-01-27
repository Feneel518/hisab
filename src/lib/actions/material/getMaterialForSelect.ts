"use server";

import { prisma } from "@/lib/prisma/db";

export async function getMaterials(businessId: string) {
  return prisma.material.findMany({
    where: {
      businessId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      unit: true,
    },
    orderBy: { name: "asc" },
  });
}
