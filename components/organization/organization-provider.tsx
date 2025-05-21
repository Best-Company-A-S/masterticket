"use client";

import { ReactNode } from "react";
import { useOrganization } from "@/lib/hooks/use-organization";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";

interface OrganizationProviderProps {
  children: ReactNode;
  requireOrganization?: boolean;
  showSwitcher?: boolean;
}

export function OrganizationProvider({
  children,
  requireOrganization = true,
  showSwitcher = true,
}: OrganizationProviderProps) {
  const {
    showCreateOrgModal,
    setShowCreateOrgModal,
    organizations,
    activeOrganization,
    isLoading,
  } = useOrganization({
    requireOrganization,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSwitcher && organizations && organizations.length > 0 && (
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganization={activeOrganization}
        />
      )}

      {children}

      <CreateOrganizationModal
        isOpen={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
      />
    </>
  );
}
