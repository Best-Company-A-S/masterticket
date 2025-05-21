"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UseOrganizationOptions {
  /**
   * Whether to redirect to login page if user is not authenticated
   * @default true
   */
  requireAuth?: boolean;

  /**
   * Whether to require an organization
   * @default true
   */
  requireOrganization?: boolean;

  /**
   * Whether to automatically redirect to the organization page if user has only one organization
   * @default false
   */
  autoRedirect?: boolean;

  /**
   * Callback when organization is loaded
   */
  onOrganizationLoaded?: (organization: any) => void;
}

export function useOrganization(options: UseOrganizationOptions = {}) {
  const {
    requireAuth = true,
    requireOrganization = true,
    autoRedirect = false,
    onOrganizationLoaded,
  } = options;

  const router = useRouter();
  const { data: session, isPending: isLoadingSession } =
    authClient.useSession();
  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations();
  const { data: activeOrganization, isPending: isLoadingActiveOrg } =
    authClient.useActiveOrganization();

  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);

  useEffect(() => {
    // If authentication is required but user is not authenticated and session loading is complete
    if (requireAuth && !session && !isLoadingSession) {
      router.push("/login");
      return;
    }

    // If we're still loading data, don't do anything yet
    if (isLoadingSession || isLoadingOrgs || isLoadingActiveOrg) {
      return;
    }

    // User is authenticated but has no organizations
    if (
      session &&
      organizations &&
      organizations.length === 0 &&
      requireOrganization
    ) {
      setShowCreateOrgModal(true);
      return;
    }

    // User has exactly one organization and autoRedirect is enabled
    if (
      session &&
      organizations &&
      organizations.length === 1 &&
      !activeOrganization &&
      autoRedirect
    ) {
      authClient.organization.setActive({
        organizationId: organizations[0].id,
      });
      return;
    }

    // Notify when organization is loaded
    if (activeOrganization && onOrganizationLoaded) {
      onOrganizationLoaded(activeOrganization);
    }
  }, [
    session,
    organizations,
    activeOrganization,
    isLoadingSession,
    isLoadingOrgs,
    isLoadingActiveOrg,
    requireAuth,
    requireOrganization,
    autoRedirect,
    router,
    onOrganizationLoaded,
  ]);

  return {
    session,
    organizations,
    activeOrganization,
    isLoading: isLoadingSession || isLoadingOrgs || isLoadingActiveOrg,
    showCreateOrgModal,
    setShowCreateOrgModal,
    selectOrganization: (organizationId: string) => {
      return authClient.organization.setActive({
        organizationId,
      });
    },
  };
}
