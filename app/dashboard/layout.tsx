"use client";

import { OrganizationProvider } from "@/components/organization/organization-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider requireOrganization={true} showSwitcher={true}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </OrganizationProvider>
  );
}
