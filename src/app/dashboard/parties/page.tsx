import PartiesCards from "@/components/dashboard/parties/parties-card";
import PartiesTable from "@/components/dashboard/parties/parties-table";
import PartiesToolbar from "@/components/dashboard/parties/parties-toolbar";
import { requireBusiness } from "@/lib/actions/business/getBusiness";
import { prisma } from "@/lib/prisma/db";
import { partiesSearchParamsCache } from "@/lib/searchParams/parties.search-params";
import { FC } from "react";
import { is } from "zod/v4/locales";

interface pageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const business = await requireBusiness();

  const sp = partiesSearchParamsCache.parse(await searchParams);

  //   // ✅ normalize like your snippet
  const q = sp.q.trim();
  const kind = sp.kind; // "ALL" | "CUSTOMER" | ...
  const active = sp.active; // "all" | "true" | "false"
  const page = Math.max(1, sp.page);
  const pageSize = 15;

  // Resolve async searchParams (Next.js App Router provides this as a Promise)

  const where = {
    businessId: business.id,
    ...(kind !== "ALL" ? { kind } : {}),
    ...(active === "all"
      ? {}
      : active === "deleted"
        ? { deletedAt: { not: null } }
        : active === "true"
          ? { isActive: active === "true", deletedAt: null }
          : { isActive: active === "false", deletedAt: null }),
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
    prisma.party.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        kind: true,
        phone: true,
        gstin: true,
        city: true,
        isActive: true,
        createdAt: true,
        deletedAt: true,
        addressLine1: true,
      },
    }),
    prisma.party.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Parties</h1>
          <p className="text-sm text-muted-foreground">
            Manage customers, suppliers and job workers.
          </p>
        </div>

        {/* Toolbar will use nuqs hooks */}
        <PartiesToolbar />
      </div>

      <div className="mt-4">
        <div className="hidden md:block">
          <PartiesTable
            items={items}
            total={total}
            page={page}
            totalPages={totalPages}
          />
        </div>

        <div className="md:hidden">
          <PartiesCards
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
