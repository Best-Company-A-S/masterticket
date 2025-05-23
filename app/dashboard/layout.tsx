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
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </TeamProvider>
    </OrganizationProvider>
  );
}
