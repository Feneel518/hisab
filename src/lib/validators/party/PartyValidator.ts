import { PartyKind } from "@/lib/generated/prisma/enums";
import z from "zod";

export const partyCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Party name is required"),
  kind: z.nativeEnum(PartyKind).default(PartyKind.CUSTOMER),

  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9]{10}$/.test(v), "Phone must be 10 digits"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
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
  pan: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v),
      "Invalid PAN format (e.g., ABCDE1234F)"
    ),

  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9]{6}$/.test(v), "Pincode must be 6 digits"),
  city: z.string().optional(),
});

export type PartyCreateSchemaRequest = z.infer<typeof partyCreateSchema>;
