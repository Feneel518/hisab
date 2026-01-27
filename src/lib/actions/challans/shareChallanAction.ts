"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { challanEmailHtml } from "@/lib/email/challanEmailTemplate";
import { buildChallanWhatsAppText } from "@/lib/email/challanWhatsappTemplate";
import transporter from "@/lib/email/nodemailer";
import { formatINRCompact } from "@/lib/format/currency";

import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";
import { prisma } from "@/lib/prisma/db";
import {
  shareChallanSchema,
  ShareChallanSchemaRequest,
} from "@/lib/validators/challan/sendChallanValidator";

type ActionResult =
  | { ok: true; whatsappUrl?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_URL = process.env.NEXT_PUBLIC_API_URL;

const buildPublicChallanUrl = (challanId: string) => {
  if (!APP_URL) throw new Error("NEXT_PUBLIC_APP_URL is not set");
  return `${APP_URL}/challans/${challanId}/view`;
};

const buildWhatsAppUrl = (opts: { phone?: string; text: string }) => {
  const encoded = encodeURIComponent(opts.text);
  const phone = (opts.phone ?? "").replace(/\s/g, "");
  return phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
};

export const shareChallanAction = async (
  input: ShareChallanSchemaRequest
): Promise<ActionResult> => {
  const user = await requireAuth();

  const parsed = shareChallanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { challanId, mode, email, phone, message } = parsed.data;

  // 1) Authorization: challan must belong to user's business
  const challan = await prisma.registerEntry.findFirst({
    where: {
      id: challanId,
      business: { ownerId: user.id }, // adjust based on your schema
    },
    select: {
      id: true,
      challanNo: true,
      createdAt: true,
      date: true,
      business: true,
      party: {
        select: {
          name: true,
        },
      },
      totalAmount: true,
      // partyName: true,
      // totalAmount: true,
    },
  });

  if (!challan) {
    return {
      ok: false,
      message: "Challan not found or you don’t have access.",
    };
  }

  const publicUrl = buildPublicChallanUrl(challan.id);

  // Require email for EMAIL/BOTH
  if ((mode === "EMAIL" || mode === "BOTH") && !email) {
    return {
      ok: false,
      message: "Email is required.",
      fieldErrors: { email: ["Email is required"] },
    };
  }

  // Send email if requested
  if (mode === "EMAIL" || mode === "BOTH") {
    if (!EMAIL_FROM) {
      return { ok: false, message: "EMAIL_FROM is not set on server." };
    }

    const subject = `Challan${
      challan.challanNo
        ? `${getFinancialYearKey(challan.date)}-${pad(
            Number(challan.challanNo)
          )}`
        : ""
    }`;
    const html = challanEmailHtml({
      publicUrl,
      note: message,
      company: {
        name: challan.business.name,
        phone: challan.business.phone ?? undefined,
        email: challan.business.email ?? undefined,
        addressLine1: challan.business.addressLine1 ?? undefined,
        addressLine2: challan.business.addressLine2 ?? undefined,
        city: challan.business.city ?? undefined,
        pincode: challan.business.pincode ?? undefined,
        gstin: challan.business.gstin ?? undefined,
      },
      challan: {
        challanNumber: challan.challanNo ?? undefined,
        challanDate: challan.date.toLocaleDateString(),
        partyName: challan.party?.name ?? undefined,
        totalAmount: formatINRCompact(challan.totalAmount ?? 0),
      },
    });

    // 3) Send email if needed

    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: email!,
        subject,
        html,
        text: `${message ? message + "\n\n" : ""}${publicUrl}`,
      });
      console.log("Send email to", email, "with link", publicUrl);
    } catch (e) {
      return {
        ok: false,
        message: "Failed to send email. Please try again.",
      };
    }
  }

  // 4) Return WhatsApp URL if needed (client opens)

  const text = buildChallanWhatsAppText({
    company: {
      name: challan.business.name,
      phone: challan.business.phone ?? undefined,
      email: challan.business.email ?? undefined,
      city: challan.business.city ?? undefined,
      gstin: challan.business.gstin ?? undefined,
    },
    challan: {
      challanNumber: challan.challanNo ?? undefined,
      challanDate: challan.date.toLocaleDateString(),
      partyName: challan.party?.name ?? undefined,
      totalAmount: formatINRCompact(challan.totalAmount ?? 0),
    },
    publicUrl,
    note: message,
  });
  const whatsappUrl =
    mode === "WHATSAPP" || mode === "BOTH"
      ? buildWhatsAppUrl({ phone, text: text })
      : undefined;

  return { ok: true, whatsappUrl };
};
