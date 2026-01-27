import z from "zod";

const challanItemSchema = z
  .object({
    id: z.string().optional(),
    materialId: z.string().uuid().optional().nullable(),
    materialName: z.string().trim().optional().nullable(),
    unit: z.string().trim().optional().nullable(),

    quantity: z.coerce.number().positive("Quantity must be > 0"),
    rate: z.coerce.number().nonnegative().optional().nullable(),
    amount: z.coerce.number().nonnegative().optional().nullable(),
    discount: z.coerce.number().nonnegative().optional().nullable(),
  })
  .refine((v) => !!v.materialId || (!!v.materialName && !!v.unit), {
    message: "Select a material or enter material name + unit.",
  });

export const createChallanSchema = z.object({
  id: z.string().optional(),

  businessId: z.string().uuid(),
  partyId: z.string().uuid(),

  date: z.coerce.date(),
  challanNo: z.string().trim().min(1).optional().nullable(),
  vehicleNo: z.string().trim().optional().nullable(),
  remarks: z.string().trim().optional().nullable(),

  purpose: z
    .enum(["PURCHASE", "SALE", "JOBWORK", "RETURN", "TRANSFER", "OTHER"])
    .default("SALE"),

  discountOnChallan: z.coerce.number().nonnegative().optional().nullable(),

  items: z.array(challanItemSchema).min(1, "Add at least 1 item"),
});

export type createChallanSchemaRequest = z.infer<typeof createChallanSchema>;
