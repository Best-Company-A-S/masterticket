"use client";

import { ReactNode, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending: isLoadingSession } =
    authClient.useSession();
  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations();
  const [hasSetActiveOrg, setHasSetActiveOrg] = useState(false);

  // This effect ensures that we set an active organization if the user has organizations
  // but no active organization is set
  useEffect(() => {
    // Flag to track if component is mounted
    let isMounted = true;

    // Only run this logic once per session
    if (hasSetActiveOrg) return;

    // Wait until we have session and organizations data
    if (isLoadingSession || isLoadingOrgs) return;

    // If user is logged in and has organizations
    if (session && organizations && organizations.length > 0) {
      // Check if we already have an active organization by making a direct API call
      authClient.organization
        .getFullOrganization()
        .then((org) => {
          if (!isMounted) return;

          // If no active organization, set the first one as active
          if (!org && organizations.length > 0) {
            authClient.organization
              .setActive({
                organizationId: organizations[0].id,
              })
              .then(() => {
                if (isMounted) {
                  setHasSetActiveOrg(true);
                }
              });
          } else {
            // We have an active organization already
            setHasSetActiveOrg(true);
          }
        })
        .catch((error) => {
          if (!isMounted) return;

          // If we get an error (like 401), it means no active organization is set
          // So set the first organization as active
          if (organizations.length > 0) {
            authClient.organization
              .setActive({
                organizationId: organizations[0].id,
              })
              .then(() => {
                if (isMounted) {
                  setHasSetActiveOrg(true);
                }
              });
          }
        });
    }

    // Cleanup function to prevent async updates after unmount
    return () => {
      isMounted = false;
    };
  }, [
    session,
    organizations,
    isLoadingSession,
    isLoadingOrgs,
    hasSetActiveOrg,
  ]);

  return <>{children}</>;
}
