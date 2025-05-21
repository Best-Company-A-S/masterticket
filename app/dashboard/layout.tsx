"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { OrganizationProvider } from "@/components/organization/organization-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider requireOrganization={true} showSwitcher={false}>
      <AppSidebar />
      <div className="w-full h-screen">{children}</div>
    </OrganizationProvider>
  );
}
