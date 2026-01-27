import { AppSidebar } from "@/components/helpers/app-sidebar";
import { SiteHeader } from "@/components/helpers/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireOnboarded } from "@/lib/onboarding/require-onboarded";
import { FC } from "react";

interface layoutProps {
  children: React.ReactNode;
}

const layout: FC<layoutProps> = async ({ children }) => {
  const data = await requireOnboarded();
  return (
    <>
      <SidebarProvider
        className="print:hidden"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }>
        <AppSidebar variant="inset" className="print:hidden" />
        <SidebarInset className="">
          <SiteHeader
            businessName={data.businessName}
            businessId={data.businessId}
          />
          <div className="p-4 sm:p-6 bg-sidebar-accent min-h-screen">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <div className="print:flex hidden">{children}</div>
    </>
  );
};

export default layout;
