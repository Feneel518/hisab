"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import {
  BillingStatus,
  EntryPurpose,
  EntryType,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/db";
import { notFound } from "next/navigation";

export const getPartyDetailsAction = async ({
  partyId,
  filters,
  businessId,
}: {
  partyId: string;
  businessId: string;
  filters: PartyDetailsFilter;
}) => {
  const user = await requireAuth();

  const party = await prisma.party.findFirst({
    where: {
      id: partyId,
      businessId,
    },
    select: {
      id: true,
      name: true,
      kind: true,
      phone: true,
      email: true,
      gstin: true,
      pan: true,
      city: true,
      pincode: true,
      addressLine1: true,
      addressLine2: true,
      isActive: true,
      deletedAt: true,
      deletedBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!party) notFound();

  const where = buildEntriesWhere({ businessId, partyId, f: filters });

  // KPIS
  // const [saleAgg, purchaseAgg, unbilledCount, lastActivity] = await Promise.all(
  //   [
  //     prisma.registerEntry.aggregate({
  //       where: { ...where, purpose: EntryPurpose.SALE },
  //       _sum: { amount: true },
  //     }),
  //     prisma.registerEntry.aggregate({
  //       where: { ...where, purpose: EntryPurpose.PURCHASE },
  //       _sum: { amount: true },
  //     }),
  //     prisma.registerEntry.count({
  //       where: { ...where, billingStatus: BillingStatus.UNBILLED },
  //     }),
  //     prisma.registerEntry.findFirst({
  //       where,
  //       orderBy: { date: "desc" },
  //       select: { date: true },
  //     }),
  //   ],
  // );

  // Entries List
  const skip = (filters.page - 1) * filters.pageSize;
  const take = filters.pageSize;

  const [entries, totalEntries] = await Promise.all([
    prisma.registerEntry.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take,
      select: {
        id: true,
        date: true,
        type: true,
        purpose: true,
        // quantity: true,
        // unit: true,
        // rate: true,
        // amount: true,
        // discount: true,
        challanNo: true,
        vehicleNo: true,
        remarks: true,
        billingStatus: true,
        bill: { select: { id: true, billNo: true } },
        // material: { select: { id: true, name: true, unit: true } },
        // materialName: true,
      },
    }),
    prisma.registerEntry.count({ where }),
  ]);

  // Monthly sales chart (OUTWARD+SALE typically, but purpose=SALE is enough)
  const monthlySales = await getMonthlySales({
    businessId,
    from: filters.from,
    partyId,
    to: filters.to,
  });

  // Unbilled aging buckets (based on all-time unbilled or filtered range—choose filtered range for MVP)
  // const unbilledAging = await getUnbilledAgingBuckets({
  //   businessId,
  //   partyId,
  //   from: filters.from,
  //   to: filters.to,
  // });

  return {
    party,
    // kpis: {
    //   totalSales: Number(saleAgg._sum.amount ?? 0),
    //   totalPurchase: Number(purchaseAgg._sum.amount ?? 0),
    //   unbilledCount,
    //   lastActivity: lastActivity?.date ?? null,
    // },
    monthlySales,
    // unbilledAging,
    entries,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total: totalEntries,
      totalPages: Math.max(1, Math.ceil(totalEntries / filters.pageSize)),
    },
  };
};

export type PartyDetailsFilter = {
  from: Date;
  to: Date;
  type: EntryType | "ALL";
  purpose: EntryPurpose | "ALL";
  billing: BillingStatus | "ALL";
  q: string;
  page: number;
  pageSize: number;
};

export const parsePartyDetailsFilter = async (
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PartyDetailsFilter> => {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 90);

  const fromStr =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toStr =
    typeof searchParams.to === "string" ? searchParams.to : undefined;

  const from = fromStr ? new Date(fromStr) : defaultFrom;
  const to = toStr ? new Date(toStr) : now;

  // normalize to include the full "to" day
  to.setHours(23, 59, 59, 999);

  const type = (
    typeof searchParams.type === "string" ? searchParams.type : "ALL"
  ) as PartyDetailsFilter["type"];
  const purpose = (
    typeof searchParams.purpose === "string" ? searchParams.purpose : "ALL"
  ) as PartyDetailsFilter["purpose"];
  const billing = (
    typeof searchParams.billing === "string" ? searchParams.billing : "ALL"
  ) as PartyDetailsFilter["billing"];

  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const page = Math.max(
    1,
    Number(typeof searchParams.page === "string" ? searchParams.page : 1) || 1,
  );
  const pageSize = Math.min(
    100,
    Math.max(
      10,
      Number(
        typeof searchParams.pageSize === "string" ? searchParams.pageSize : 20,
      ) || 20,
    ),
  );

  return { from, to, type, purpose, billing, q, page, pageSize };
};

const buildEntriesWhere = (opts: {
  businessId: string;
  partyId: string;
  f: PartyDetailsFilter;
}) => {
  const { businessId, f, partyId } = opts;

  const and: any[] = [
    { businessId },
    { partyId },
    { date: { gte: f.from, lte: f.to } },
  ];

  if (f.type !== "ALL") and.push({ type: f.type });
  if (f.purpose !== "ALL") and.push({ purpose: f.purpose });
  if (f.billing !== "ALL") and.push({ billingStatus: f.billing });

  if (f.q && f.q.length > 0) {
    and.push({
      OR: [
        { materialName: { contains: f.q, mode: "insensitive" } },
        { challanNo: { contains: f.q, mode: "insensitive" } },
        { vehicleNo: { contains: f.q, mode: "insensitive" } },
        // material relation search
        { material: { name: { contains: f.q, mode: "insensitive" } } },
      ],
    });
  }

  return { AND: and };
};

const getMonthlySales = async (opts: {
  businessId: string;
  partyId: string;
  from: Date;
  to: Date;
}) => {
  const rows = await prisma.$queryRaw<
    Array<{ month: Date; amount: number | null }>
  >`
    SELECT date_trunc('month', "date") AS month,
           COALESCE(SUM(COALESCE("amount", 0)), 0) AS amount
    FROM "RegisterEntry"
    WHERE "businessId" = ${opts.businessId}
      AND "partyId" = ${opts.partyId}
      AND "purpose" = 'SALE'
      AND "date" >= ${opts.from}
      AND "date" <= ${opts.to}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  return rows.map((r: any) => ({
    month: r.month.toISOString(),
    amount: Number(r.amount ?? 0),
  }));
};

// async function getUnbilledAgingBuckets(opts: {
//   businessId: string;
//   partyId: string;
//   from: Date;
//   to: Date;
// }) {
//   const unbilled = await prisma.registerEntry.findMany({
//     where: {
//       businessId: opts.businessId,
//       partyId: opts.partyId,
//       billingStatus: BillingStatus.UNBILLED,
//       date: { gte: opts.from, lte: opts.to },
//     },
//     select: { date: true, amount: true },
//   });

//   const now = new Date();
//   const buckets = [
//     { key: "0_7", label: "0–7 days", count: 0, amount: 0 },
//     { key: "8_15", label: "8–15 days", count: 0, amount: 0 },
//     { key: "16_30", label: "16–30 days", count: 0, amount: 0 },
//     { key: "31_60", label: "31–60 days", count: 0, amount: 0 },
//     { key: "60_plus", label: "60+ days", count: 0, amount: 0 },
//   ];

//   for (const e of unbilled) {
//     const days = Math.floor(
//       (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24),
//     );
//     const amt = Number(e.amount ?? 0);

//     if (days <= 7) {
//       buckets[0].count++;
//       buckets[0].amount += amt;
//     } else if (days <= 15) {
//       buckets[1].count++;
//       buckets[1].amount += amt;
//     } else if (days <= 30) {
//       buckets[2].count++;
//       buckets[2].amount += amt;
//     } else if (days <= 60) {
//       buckets[3].count++;
//       buckets[3].amount += amt;
//     } else {
//       buckets[4].count++;
//       buckets[4].amount += amt;
//     }
//   }

//   return buckets.map((b) => ({ ...b, amount: Number(b.amount) }));
// }
