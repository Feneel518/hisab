import "server-only";
import { requireAuth } from "../auth/require-auth";
import { prisma } from "../prisma/db";
import { redirect } from "next/navigation";

export const requireOnboarded = async () => {
  const user = await requireAuth();

  const business = await prisma.business.findUnique({
    where: {
      ownerId: user.id,
    },
    select: { id: true, parties: true, name: true },
  });

  //   Step-1: business is required
  if (!business) {
    redirect("/onboarding/business");
  }

  const partyCount = business.parties.length;

  //   Step-2: Atleast 1 party required
  if (partyCount === 0) {
    redirect("/onbaording/party");
  }

  //   onboarding done
  return {
    userName: user.name,
    userId: user.id,
    businessId: business.id,
    businessName: business.name,
  };
};
