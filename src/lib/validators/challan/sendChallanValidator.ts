import z from "zod";

export type ShareMode = "WHATSAPP" | "EMAIL" | "BOTH";

export const shareChallanSchema = z.object({
  challanId: z.string().min(1),
  mode: z.enum(["WHATSAPP", "EMAIL", "BOTH"]),

  // WhatsApp
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,15}$/.test(val.replace(/\s/g, "")),
      "Enter a valid phone (10–15 digits, no +)."
    ),

  // Email
  email: z.string().trim().optional(),

  // Optional message customization
  message: z.string().trim().max(500).optional(),
});

export type ShareChallanSchemaRequest = z.infer<typeof shareChallanSchema>;
