import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma/db";

export const requireBusiness = async () => {
  const user = await requireAuth();

  const business = await prisma.business.findUnique({
    where: { ownerId: user.id },
    select: { id: true, onboardingStatus: true, name: true, ownerId: true },
  });

  if (!business) {
    // redirect("/onboarding/business") if you have it
    throw new Error("Business not found for current user.");
  }

  return business;
};
