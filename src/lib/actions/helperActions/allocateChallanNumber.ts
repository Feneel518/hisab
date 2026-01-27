"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { PrismaClient } from "@/lib/generated/prisma/internal/class";
import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";

export const allocateChallanNumber = async (opts: {
  prisma: Prisma.TransactionClient;
  businessId: string;
  date: Date;
}) => {
  const yearKey = getFinancialYearKey(opts.date);

  const counter = await opts.prisma.businessCounter.upsert({
    where: {
      businessId_counterType_yearKey: {
        businessId: opts.businessId,
        counterType: "CHALLAN",
        yearKey,
      },
    },
    create: {
      businessId: opts.businessId,
      counterType: "CHALLAN",
      yearKey,
      nextNumber: 2,
    },
    update: {
      nextNumber: { increment: 1 },
    },
    select: { yearKey: true, nextNumber: true },
  });

  const issued = counter.nextNumber - 1;

  const challanNumber = `${counter.yearKey}/${pad(issued, 4)}`;

  return { challanNumber, yearKey, issued };
};
