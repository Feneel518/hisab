"use server";

import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { prisma } from "@/lib/prisma/db";

type ActionResult =
  | { ok: true; items: UnbilledChallanDTO[] }
  | { ok: false; message: string };

export type UnbilledChallanDTO = {
  id: string;
  challanNo: string | null;
  date: string; // ISO for client
  vehicleNo: string | null;
  purpose: string;
  totalAmount: number | null;
  items: Array<{
    id: string;
    material: {
      name: string;
      unit: string | null;
    };

    quantity: number;
    rate: number | null;
    discount: number | null;
    amount: number | null;
  }>;
};

export async function getUnbilledChallansForPartyAction(input: {
  partyId: string;
}): Promise<ActionResult> {
  try {
    const business = await requireBusiness();
    if (!input.partyId) {
      return { ok: false, message: "Party is required." };
    }

    const items = await prisma.registerEntry.findMany({
      where: {
        businessId: business.id,
        partyId: input.partyId,
        billingStatus: "UNBILLED",
        billId: null,

        // optional guards (enable if you want strict behavior)
        challanNo: { not: null },
        type: "OUTWARD",
        purpose: { in: ["SALE", "JOBWORK"] },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        challanNo: true,
        date: true,
        vehicleNo: true,
        purpose: true,
        totalAmount: true,
        items: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,

            material: {
              select: {
                name: true,
                unit: true,
              },
            },

            quantity: true,
            rate: true,
            discount: true,
            amount: true,
          },
        },
      },
    });
    console.log(items.map((c) => c.items.map((i) => i.material?.name)));

    return {
      ok: true,
      items: items.map((c) => ({
        ...c,
        date: c.date.toISOString(),
      })) as UnbilledChallanDTO[],
    };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Failed to load challans." };
  }
}
