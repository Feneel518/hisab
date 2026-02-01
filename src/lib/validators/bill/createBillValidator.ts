import { z } from "zod";

/**
 * Create bill request
 * - partyId required
 * - selectedChallanIds must have >= 1
 * - lines are editable item overrides (rate/discount) per challanItem
 */
export const createBillSchema = z
  .object({
    businessId: z.string().min(1, "Business is required"),
    partyId: z.string().min(1, "Party is required"),

    billDate: z.coerce.date(),

    // UI may show something, but server will generate & store actual Bill.billNo
    billNo: z.string().optional(),

    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),

    notes: z.string().max(2000).optional().nullable(),

    selectedChallanIds: z
      .array(z.string().min(1))
      .min(1, "Select at least 1 challan to bill"),

    lines: z
      .array(
        z.object({
          challanId: z.string().min(1),
          itemId: z.string().min(1),

          // readonly in UI but ok to carry through
          materialName: z.string().optional(),
          unit: z.string().optional(),
          quantity: z.coerce.number().min(0),

          // editable
          rate: z.coerce.number().min(0),
          discount: z.coerce.number().min(0).max(100),
        }),
      )
      .min(1, "No bill lines found. Select challans first."),
  })
  .refine(
    (v) => !v.periodStart || !v.periodEnd || v.periodStart <= v.periodEnd,
    {
      message: "Period start must be before period end",
      path: ["periodEnd"],
    },
  );

export type createBillSchemaRequest = z.infer<typeof createBillSchema>;
