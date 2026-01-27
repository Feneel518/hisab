import ChallanForm from "@/components/dashboard/challans/challan-form";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { getNextChallanNumber } from "@/lib/actions/helperActions/getNextChallanNumber";
import { getMaterials } from "@/lib/actions/material/getMaterialForSelect";
import { getParties } from "@/lib/actions/party/getPartiesForSelect";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const business = await requireBusiness();

  const parties = await getParties(business.id);
  const materials = await getMaterials(business.id);

  const challanNumber = await getNextChallanNumber(business.id);

  return (
    <div>
      <ChallanForm
        parties={parties}
        materials={materials}
        businessId={business.id}
        challanNumber={challanNumber.challanNumber!}></ChallanForm>
    </div>
  );
};

export default page;
