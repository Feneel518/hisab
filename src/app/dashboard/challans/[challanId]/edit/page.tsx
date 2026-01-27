import ChallanForm from "@/components/dashboard/challans/challan-form";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { getChallanDetails } from "@/lib/actions/challans/getChallanDetails";
import { getMaterials } from "@/lib/actions/material/getMaterialForSelect";
import { getParties } from "@/lib/actions/party/getPartiesForSelect";
import { FC } from "react";

interface pageProps {
  params: Promise<{
    challanId: string;
  }>;
}

const page: FC<pageProps> = async ({ params }) => {
  const { challanId } = await params;
  const business = await requireBusiness();

  const parties = await getParties(business.id);
  const materials = await getMaterials(business.id);

  const challanDetails = await getChallanDetails(challanId);

  return (
    <div>
      <ChallanForm
        parties={parties}
        materials={materials}
        businessId={business.id}
        // @ts-ignore
        challan={challanDetails}></ChallanForm>
    </div>
  );
};

export default page;
