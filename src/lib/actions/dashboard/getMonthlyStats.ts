import { requireAuth } from "@/lib/auth/require-auth";
import { getCurrentMonthRange } from "@/lib/helpers/GetMonthRange";
import { prisma } from "@/lib/prisma/db";

export const getMonthlyDashboardHeaderStats = async (businessId: string) => {
  const user = await requireAuth();

  const { end, start } = getCurrentMonthRange();

  // const [entryCount, turnoverAgg] = await Promise.all([
  //   prisma.registerEntry.count({
  //     where: {
  //       businessId,
  //       date: { gte: start, lte: end },
  //     },
  //   }),

  //   prisma.registerEntry.aggregate({
  //     where: {
  //       businessId,
  //       type: "OUTWARD",
  //       date: { gte: start, lte: end },
  //     },
  //     _sum: {
  //       amount: true,
  //     },
  //   }),
  // ]);
  return { ok: true };

  // return {
  //   entryCount,
  //   turnover: turnoverAgg._sum.amount ?? 0,
  // };
};
