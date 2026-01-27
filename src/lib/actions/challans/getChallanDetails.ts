"use server";

import { prisma } from "@/lib/prisma/db";
import { requireBusiness } from "../business/getBusiness";

export const getChallanDetails = async (challanId: string) => {
  const business = await requireBusiness();

  const challan = await prisma.registerEntry.findUnique({
    where: {
      id: challanId,
      businessId: business.id,
    },
    include: {
      items: true,
    },
  });

  return challan;
};
