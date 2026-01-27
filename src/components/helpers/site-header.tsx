import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getMonthlyDashboardHeaderStats } from "@/lib/actions/dashboard/getMonthlyStats";
import { formatINRCompact } from "@/lib/format/currency";

export async function SiteHeader({
  businessName,
  businessId,
}: {
  businessName: string;
  businessId: string;
}) {
  const stats = await getMonthlyDashboardHeaderStats(businessId);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          Hello, <strong>{businessName}</strong>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
            📆 <span className="font-medium">This Month:</span>
            <span>{stats.entryCount} entries</span>
            <span>·</span>
            <span className="font-semibold">
              {formatINRCompact(stats.turnover)} turnover
            </span>
          </div> */}
        </div>
      </div>
    </header>
  );
}
