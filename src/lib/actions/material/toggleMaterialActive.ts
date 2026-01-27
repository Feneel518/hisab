"use server";

import { prisma } from "@/lib/prisma/db";
import { requireBusiness } from "../business/getBusiness";
import { revalidatePath } from "next/cache";
import { prismaError } from "../error";

export const toggleMaterialActiveAction = async (materialId: string) => {
  const business = await requireBusiness();

  try {
    // Read minimal state (still needed to invert)
    const material = await prisma.material.findFirst({
      where: { id: materialId, businessId: business.id },
      select: { id: true, isActive: true },
    });

    if (!material)
      return { ok: false, code: "NOT_FOUND", message: "Material not found." };

    await prisma.material.update({
      where: { id: material.id },
      data: { isActive: !material.isActive },
    });

    revalidatePath("/dashboard/materials");
    return { ok: true };
  } catch (error) {
    return prismaError(error);
  }
};
