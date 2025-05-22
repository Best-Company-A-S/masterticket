"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { OrganizationProvider } from "@/components/organization/organization-provider";
import { TeamProvider } from "@/components/organization/team-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider requireOrganization={true} showSwitcher={false}>
      <TeamProvider>
        <AppSidebar />
        <div className="w-full h-screen">{children}</div>
      </TeamProvider>
    </OrganizationProvider>
  );
}
