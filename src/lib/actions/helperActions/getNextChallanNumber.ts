"use server";

import { getFinancialYearKey } from "@/lib/helpers/getFinancialYear";
import { prisma } from "@/lib/prisma/db";

export const getNextChallanNumber = async (businessId: string) => {
  const date = new Date();
  const yearKey = getFinancialYearKey(date);

  const haveChallansThisFinancialYear = await prisma.business.findFirst({
    where: {
      id: businessId,
      businessCounters: {
        some: {
          counterType: "CHALLAN",
          yearKey,
        },
      },
    },
    select: {
      entries: true,
    },
  });

  if (
    !haveChallansThisFinancialYear ||
    haveChallansThisFinancialYear.entries.length === 0
  ) {
    return {
      challanNumber: 1,
    };
  }

  const challanCounter = await prisma.businessCounter.findUnique({
    where: {
      businessId_counterType_yearKey: {
        businessId,
        counterType: "CHALLAN",
        yearKey,
      },
    },
    select: {
      nextNumber: true,
    },
  });

  return {
    challanNumber: challanCounter?.nextNumber,
  };
};
