"use server";

import {
  createChallanSchema,
  createChallanSchemaRequest,
} from "@/lib/validators/challan/challanValidator";
import { requireBusiness } from "../business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

function computeTotals(input: createChallanSchemaRequest) {
  const headerDisc = Number(input.discountOnChallan ?? 0);

  const items = input.items.map((it) => {
    const qty = Number(it.quantity ?? 0);
    const rate = Number(it.rate ?? 0);

    // Your UI uses discount as PERCENT
    const lineDisc = headerDisc === 0 ? Number(it.discount ?? 0) : 0;

    const gross = rate * qty;
    const net = Math.max(0, gross * ((100 - lineDisc) / 100));

    return {
      ...it,
      quantity: qty,
      rate: it.rate ?? null,
      discount: it.discount ?? null,
      amount: it.amount ?? net, // you can store net always
      _net: net,
    };
  });

  const totalQuantity = items.reduce((s, it) => s + it.quantity, 0);
  const subTotal = items.reduce((s, it) => s + it._net, 0);
  const totalAmount = Math.max(0, subTotal * ((100 - headerDisc) / 100));

  return { items, totalQuantity, totalAmount };
}

export const updateChallanAction = async (
  values: createChallanSchemaRequest
) => {
  const business = await requireBusiness();

  const parsed = await createChallanSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const { items, totalAmount, totalQuantity } = computeTotals(values);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.registerEntry.findFirst({
        where: {
          id: data.id,
          businessId: data.businessId,
          type: "OUTWARD",
          purpose: { in: ["JOBWORK", "SALE"] },
        },
        select: {
          id: true,
          billingStatus: true,
          challanNo: true,
        },
      });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }
      // Optional: disallow editing once billed
      if (existing.billingStatus !== "UNBILLED") {
        throw new Error("LOCKED_BILLED");
      }

      // 2) Update header (do NOT change challanNo unless you allow it)
      await tx.registerEntry.update({
        where: { id: data.id },
        data: {
          partyId: data.partyId,
          date: data.date,
          vehicleNo: data.vehicleNo,
          remarks: data.remarks,
          discountOnChallan: data.discountOnChallan,
          purpose: data.purpose,
          totalAmount,
          totalQuantity,
        },
      });
      await tx.challanItems.deleteMany({
        where: {
          challanId: data.id,
        },
      });

      await tx.challanItems.createMany({
        data: items.map((it) => {
          return {
            challanId: data.id!,

            materialId: it.materialId ?? null,
            materialName: it.materialId ? null : it.materialName ?? null,
            unit: it.unit,

            quantity: it.quantity,
            rate: it.rate ?? null,
            discount: it.discount ?? null,
            amount: it._net ?? null,
          };
        }),
      });

      return { id: data.id };
    });
    revalidatePath(`/dashboard/challans`);
    revalidatePath(`/dashboard/challans/${result.id}`);

    return { ok: true, challanId: result.id };
  } catch (error: any) {
    if (error?.message === "NOT_FOUND") {
      return { ok: false, message: "Challan not found." };
    }
    if (error?.message === "LOCKED_BILLED") {
      return {
        ok: false,
        message: "This challan is billed and cannot be edited.",
      };
    }
    // Unique challanNo conflict (if you allow editing challanNo)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        message: "Challan number already exists for this business.",
      };
    }
    return {
      ok: false,
      message: "Something went wrong while updating challan.",
    };
  }
};
