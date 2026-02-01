import BillForm from "@/components/dashboard/bills/BillForm";
import { getPartiesForSelect } from "@/components/dashboard/bills/getPartiesForSelect";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { getParties } from "@/lib/actions/party/getPartiesForSelect";
import { redirect } from "next/navigation";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const busines = await requireBusiness();

  const res = await getPartiesForSelect();

  if (!res.ok) {
    redirect("/dashboard");
  }

  const parties = res.items;

  return (
    <div>
      <BillForm businessId={busines.id} parties={parties}></BillForm>
    </div>
  );
};

export default page;
