import BillToolbar from "@/components/dashboard/bills/BillsToolbar";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { partiesSearchParamsCache } from "@/lib/searchParams/parties.search-params";
import { FC } from "react";

interface pageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const business = await requireBusiness();

  const sp = partiesSearchParamsCache.parse(await searchParams);

  //   // ✅ normalize like your snippet
  const q = sp.q.trim();
  const active = sp.active; // "all" | "true" | "false"
  const page = Math.max(1, sp.page);
  const pageSize = 15;

  return (
    <div className="">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Bills</h1>
          <p className="text-sm text-muted-foreground">
            Manage your bills list used in entries and bills.
          </p>
        </div>

        <BillToolbar></BillToolbar>
      </div>

      <div className="mt-4">
        <div className="hidden md:block">
          {/* <ChallanTable
            items={items}
            page={page}
            total={total}
            totalPages={totalPages}></ChallanTable> */}
        </div>

        <div className="md:hidden">
          {/* <MaterialCard
             items={items}
             total={total}
             page={page}
             totalPages={totalPages}
           /> */}
        </div>
      </div>
    </div>
  );
};

export default page;
