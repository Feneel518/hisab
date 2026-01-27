"use server";

import {
  createChallanSchema,
  createChallanSchemaRequest,
} from "@/lib/validators/challan/challanValidator";
import { requireBusiness } from "../business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { allocateChallanNumber } from "../helperActions/allocateChallanNumber";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client/client";

export const createChallanAction = async (
  values: createChallanSchemaRequest,
) => {
  const business = await requireBusiness();

  const parsed = createChallanSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  //   compute totals
  const itemsComputed = data.items.map((it) => {
    const qty = it.quantity;
    const rate = it.rate ?? 0;
    const lineGross = rate * qty;
    const lineDiscount = it.discount ?? 0;
    const lineNet = Math.max(0, lineGross * ((100 - lineDiscount) / 100));

    return {
      ...it,
      rate: it.rate ?? null,
      discount: it.discount ?? null,
      amount: it.amount ?? lineNet, // store net; ignore client if you want
      _lineNet: lineNet,
    };
  });

  console.log({ itemsComputed });

  const totalQuantity = itemsComputed.reduce((s, it) => s + it.quantity, 0);
  const subTotal = itemsComputed.reduce((s, it) => s + it._lineNet, 0);
  const headerDiscount = data.discountOnChallan ?? 0;
  const totalAmount = Math.max(0, subTotal * ((100 - headerDiscount) / 100));

  try {
    const challan = await prisma.$transaction(async (tx) => {
      const { challanNumber, issued } = await allocateChallanNumber({
        prisma: tx,
        businessId: (await business).id,
        date: data.date,
      });

      const challan = await tx.registerEntry.create({
        data: {
          businessId: business.id,
          partyId: data.partyId,
          date: data.date,

          challanNo: String(issued) ?? null,
          vehicleNo: data.vehicleNo ?? null,
          remarks: data.remarks ?? null,

          type: "OUTWARD",
          purpose: data.purpose,

          discountOnChallan: data.discountOnChallan ?? 0,
          totalQuantity,
          totalAmount,

          items: {
            create: itemsComputed.map((it) => {
              return {
                materialId: it.materialId ?? null,
                materialName: it.materialId ? null : (it.materialName ?? null),
                unit: it.unit ? null : (it.unit ?? null),

                quantity: it.quantity,
                rate: it.rate ?? 0,
                discount: it.discount ?? 0,
                amount: it._lineNet ?? null,
              };
            }),
          },
        },
        select: {
          id: true,
        },
      });

      return { id: challan.id };
    });

    revalidatePath("/dashboard/challans");
    return {
      ok: true,
      challanId: challan.id,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === "P2002") {
        return {
          ok: false,
          message: "Challan number already exists for this business.",
        };
      }
    }

    return {
      ok: false,
      message: "Something went wrong while creating challan.",
    };
  }
};
