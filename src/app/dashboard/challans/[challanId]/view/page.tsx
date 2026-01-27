import ChallanView from "@/components/dashboard/challans/challan-view";
import ShareButtons from "@/components/helpers/ShareButtons";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/db";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
  params: Promise<{ challanId: string }>;
}

const page: FC<pageProps> = async ({ params }) => {
  const { challanId } = await params;

  const challan = await prisma.registerEntry.findFirst({
    where: { id: challanId },
    include: {
      party: true,
      business: true,
      items: { include: { material: true } },
    },
  });

  if (!challan) notFound();

  return (
    <div className="flex flex-col gap-8 print:gap-0">
      <ShareButtons challanId={challan.id} email={challan.party.email} phone={challan.party.phone} ></ShareButtons>
      <ChallanView challan={challan}></ChallanView>
    </div>
  );
};

export default page;
