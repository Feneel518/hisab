"use server";

import { prisma } from "@/lib/prisma/db";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import {
  createBillSchema,
  createBillSchemaRequest,
} from "@/lib/validators/bill/createBillValidator";
import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";

type ActionResult =
  | { ok: true; billId: string; billNo: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      code?: string;
    };

function zodFieldErrors(err: any) {
  const out: Record<string, string[]> = {};
  for (const issue of err?.issues ?? []) {
    const key = (issue.path?.[0] ?? "root") as string;
    out[key] = out[key] ?? [];
    out[key].push(issue.message);
  }
  return out;
}

export async function finalizeBillAction(
  raw: createBillSchemaRequest,
): Promise<ActionResult> {
  const parsed = createBillSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid form data.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;

  try {
    const business = await requireBusiness();
    if (business.id !== values.businessId) {
      return { ok: false, message: "Business mismatch." };
    }

    const yearKey = getFinancialYearKey(values.billDate);

    return await prisma.$transaction(async (tx) => {
      // 1) Ensure challans are still unbilled & match party+business
      const challanIds = values.selectedChallanIds;

      const challans = await tx.registerEntry.findMany({
        where: {
          id: { in: challanIds },
          businessId: business.id,
          partyId: values.partyId,
          billingStatus: "UNBILLED",
          billId: null,
        },
        select: {
          id: true,
          items: { select: { id: true, quantity: true } },
        },
      });

      if (challans.length !== challanIds.length) {
        return {
          ok: false as const,
          message:
            "Some challans are no longer unbilled (or not found). Refresh and try again.",
          code: "STALE_SELECTION",
        };
      }

      // 2) Lock/increment BILL counter in this tx
      const counter = await tx.businessCounter.upsert({
        where: {
          businessId_counterType_yearKey: {
            businessId: business.id,
            counterType: "BILL",
            yearKey,
          },
        },
        create: {
          businessId: business.id,
          counterType: "BILL",
          yearKey,
          nextNumber: 1,
        },
        update: {},
        select: { id: true, nextNumber: true },
      });

      const billNo = `${yearKey}-${pad(counter.nextNumber, 4)}`;

      await tx.businessCounter.update({
        where: { id: counter.id },
        data: { nextNumber: { increment: 1 } },
      });

      // 3) Create Bill header
      const bill = await tx.bill.create({
        data: {
          businessId: business.id,
          partyId: values.partyId,
          billNo,
          billDate: values.billDate,
          periodStart: values.periodStart,
          periodEnd: values.periodEnd,
          notes: values.notes ?? undefined,
        },
        select: { id: true, billNo: true },
      });

      // 4) Update challan items based on lines (server computes amounts)
      // Build quick lookup for challanItem overrides
      const overrideByItemId = new Map<
        string,
        { rate: number; discount: number }
      >();

      for (const l of values.lines) {
        overrideByItemId.set(l.itemId, {
          rate: Number(l.rate ?? 0),
          discount: Number(l.discount ?? 0),
        });
      }

      let billSubtotal = 0;

      for (const ch of challans) {
        let challanTotal = 0;

        for (const it of ch.items) {
          const override = overrideByItemId.get(it.id);

          // If UI didn't send a line for an item, treat as invalid
          if (!override) {
            return {
              ok: false as const,
              message:
                "Some bill lines are missing (items mismatch). Re-select challans and try again.",
              code: "LINES_MISMATCH",
            };
          }

          const qty = Number(it.quantity ?? 0);
          const rate = Math.max(0, Number(override.rate ?? 0));
          const discount = Math.min(
            100,
            Math.max(0, Number(override.discount ?? 0)),
          );

          const amount = Math.max(0, rate * qty * ((100 - discount) / 100));

          challanTotal += amount;

          await tx.challanItems.update({
            where: { id: it.id },
            data: {
              rate,
              discount,
              amount,
            },
          });
        }

        billSubtotal += challanTotal;

        // Mark challan billed + attach to bill
        await tx.registerEntry.update({
          where: { id: ch.id },
          data: {
            billingStatus: "BILLED",
            billId: bill.id,
            totalAmount: challanTotal,
          },
        });
      }

      // Store subtotal snapshot on bill (optional but useful)
      await tx.bill.update({
        where: { id: bill.id },
        data: { subtotal: billSubtotal },
      });

      return { ok: true as const, billId: bill.id, billNo: bill.billNo };
    });
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Failed to create bill." };
  }
}
