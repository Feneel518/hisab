import { requireBusiness } from "@/lib/actions/business/getBusiness";
import {
  getPartyDetailsAction,
  parsePartyDetailsFilter,
} from "@/lib/actions/party/getPartyDetails";
import { FC } from "react";

interface pageProps {
  params: Promise<{ partyId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ params, searchParams }) => {
  const business = await requireBusiness();
  const { partyId } = await params;
  // const filters = await parsePartyDetailsFilter(await searchParams);

  // const partyDetails = await getPartyDetailsAction({
  //   businessId: business.id,
  //   partyId,
  //   filters: undefined,
  // });

  return <div className="">Party Details for ID: {partyId}</div>;
};

export default page;
