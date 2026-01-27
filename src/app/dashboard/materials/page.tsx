import MaterialCard from "@/components/dashboard/materials/material-card";
import MaterialTable from "@/components/dashboard/materials/materials-table";
import MaterialsToolbar from "@/components/dashboard/materials/MaterialsToolbar";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
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
    ...(active === "all"
      ? {}
      : active === "deleted"
      ? { deletedAt: { not: null } }
      : active === "true"
      ? { isActive: active === "true", deletedAt: null }
      : {}),
    ...(q.length > 0
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { gstin: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.material.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        gstRate: true,
        hsnCode: true,
        isActive: true,
        unit: true,
        createdAt: true,
      },
    }),
    prisma.material.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Materials</h1>
          <p className="text-sm text-muted-foreground">
            Manage your materials list used in entries and bills.
          </p>
        </div>

        {/* Toolbar will use nuqs hooks */}
        <MaterialsToolbar></MaterialsToolbar>
      </div>

      <div className="mt-4">
        <div className="hidden md:block">
          {/* <PartiesTable
             items={items}
             total={total}
             page={page} items={} page={} total={} totalPages={}
             totalPages={totalPages}
           /> */}
          <MaterialTable
            items={items}
            page={page}
            total={total}
            totalPages={totalPages}></MaterialTable>
        </div>

        <div className="md:hidden">
          <MaterialCard
             items={items}
             total={total}
             page={page}
             totalPages={totalPages}
           />
        </div>
      </div>
    </div>
  );
};

export default page;
