"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState, useCallback } from "react";
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

  // Get current user's member information for the active organization
  const [activeMember, setActiveMember] = useState<any>(null);
  const [isLoadingActiveMember, setIsLoadingActiveMember] = useState(false);

  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);

  // Fetch active member information
  useEffect(() => {
    async function fetchActiveMember() {
      if (!session?.user?.id || !activeOrganization?.id) {
        setActiveMember(null);
        return;
      }

      setIsLoadingActiveMember(true);
      try {
        const response = await fetch(
          `/api/organization/member-info?organizationId=${activeOrganization.id}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setActiveMember(data.member);
        } else {
          setActiveMember(null);
        }
      } catch (error) {
        console.error("Error fetching active member:", error);
        setActiveMember(null);
      } finally {
        setIsLoadingActiveMember(false);
      }
    }

    fetchActiveMember();
  }, [session?.user?.id, activeOrganization?.id]);

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

    // Auto-select first organization if no active organization is set and organizations exist
    if (
      session &&
      organizations &&
      organizations.length > 0 &&
      !activeOrganization
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

  // Helper functions for role checking
  const hasRole = (roles: string | string[]) => {
    if (!activeMember?.role) return false;
    const userRoles = activeMember.role.split(",");
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.some((role) => userRoles.includes(role));
  };

  const isOwner = () => hasRole("owner");
  const isAdmin = () => hasRole(["owner", "admin"]);
  const isMember = () => hasRole(["owner", "admin", "member"]);

  // Functions for getting organization members and teams
  const getOrganizationMembers = useCallback(async () => {
    if (!activeOrganization) return null;

    try {
      const response = await fetch(
        `/api/organization/members?organizationId=${activeOrganization.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch members");
      return await response.json();
    } catch (error) {
      console.error("Error fetching members:", error);
      return null;
    }
  }, [activeOrganization]);

  const getOrganizationTeams = useCallback(async () => {
    if (!activeOrganization) return null;

    try {
      const response = await fetch(
        `/api/organization/teams?organizationId=${activeOrganization.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch teams");
      return await response.json();
    } catch (error) {
      console.error("Error fetching teams:", error);
      return null;
    }
  }, [activeOrganization]);

  return {
    session,
    organizations,
    activeOrganization,
    activeMember,
    isLoading:
      isLoadingSession ||
      isLoadingOrgs ||
      isLoadingActiveOrg ||
      isLoadingActiveMember,
    showCreateOrgModal,
    setShowCreateOrgModal,
    // Role checking helpers
    hasRole,
    isOwner,
    isAdmin,
    isMember,
    userRole: activeMember?.role,
    userTeamRole: activeMember?.team?.name ? activeMember.role : null, // Role in current team
    selectOrganization: (organizationId: string) => {
      return authClient.organization.setActive({
        organizationId,
      });
    },
    // New functions for assignments
    getOrganizationMembers,
    getOrganizationTeams,
  };
}
