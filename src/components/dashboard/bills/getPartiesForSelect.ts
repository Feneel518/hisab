"use server";

import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { PartyKind } from "@prisma/client";

export type PartySelectItem = {
  id: string;
  name: string;
  kind: PartyKind;
};

type ActionResult =
  | { ok: true; items: PartySelectItem[] }
  | { ok: false; message: string };

interface GetPartiesInput {
  kinds?: PartyKind[]; // optional filter (CUSTOMER, SUPPLIER, etc.)
  includeInactive?: boolean; // default false
}

/**
 * Fetch parties for dropdown/select usage
 * - excludes soft-deleted parties
 * - excludes inactive parties by default
 * - scoped to current business
 */
export async function getPartiesForSelect(
  input?: GetPartiesInput,
): Promise<ActionResult> {
  try {
    const business = await requireBusiness();

    const parties = await prisma.party.findMany({
      where: {
        businessId: business.id,
        deletedAt: null,
        ...(input?.includeInactive ? {} : { isActive: true }),
        ...(input?.kinds?.length ? { kind: { in: input.kinds } } : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        kind: true,
      },
    });

    return {
      ok: true,
      items: parties,
    };
  } catch (e: any) {
    return {
      ok: false,
      message: e?.message ?? "Failed to load parties.",
    };
  }
}
