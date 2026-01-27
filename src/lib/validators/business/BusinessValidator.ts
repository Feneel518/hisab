import z from "zod";

export const businessCreateSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9]{6}$/.test(v), "Pincode must be 6 digits"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  pan: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v),
      "Invalid PAN format (e.g., ABCDE1234F)"
    ),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9]{10}$/.test(v), "Phone must be 10 digits"),
  city: z.string().optional(),
  gstin: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) =>
        !v ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v),
      "Invalid GSTIN format"
    ),
});

export type BusinessCreateSchemaRequest = z.infer<typeof businessCreateSchema>;
