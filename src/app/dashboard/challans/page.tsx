import ChallanTable from "@/components/dashboard/challans/challan-table";
import ChallanToolbar from "@/components/dashboard/challans/challan-toolbar";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { getParties } from "@/lib/actions/party/getPartiesForSelect";
import { prisma } from "@/lib/prisma/db";
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

  // Resolve async searchParams (Next.js App Router provides this as a Promise)

  const where = {
    businessId: business.id,

    ...(q.length > 0
      ? {
          OR: [
            { challanNo: { contains: q, mode: "insensitive" as const } },
            {
              party: {
                name: { contains: q, mode: "insensitive" as const },
              },
            },
            { gstin: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.registerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        challanNo: true,
        date: true,
        party: {
          select: {
            name: true,
          },
        },
        purpose: true,
        items: {
          select: {
            id: true,
          },
        },
        totalAmount: true,
        billingStatus: true,
        id: true,
      },
    }),
    prisma.registerEntry.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Challans</h1>
          <p className="text-sm text-muted-foreground">
            Manage your challans list used in entries and bills.
          </p>
        </div>

        <ChallanToolbar></ChallanToolbar>
      </div>

      <div className="mt-4">
        <div className="hidden md:block">
          <ChallanTable
            items={items}
            page={page}
            total={total}
            totalPages={totalPages}></ChallanTable>
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
