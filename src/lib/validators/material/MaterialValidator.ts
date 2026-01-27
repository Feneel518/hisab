import z from "zod";

export const materialUnitOptions = ["KG", "PCS", "MTR", "LTR"] as const;
export const materialCreateSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Material name must be at least 2 characters")
    .max(80, "Material name is too long")
    .transform((v) => v.trim()),
  unit: z.enum(materialUnitOptions),
  hsnCode: z
    .string()
    .trim()
    .min(4, "HSN code should be atleast of 4 digits")
    .max(20, "HSN code too long")
    .optional()
    .or(z.literal("")),
  gstRate: z.union([z.number().int().min(0).max(28), z.nan()]).optional(),
});

export type materialCreateSchemaRequest = z.infer<typeof materialCreateSchema>;
