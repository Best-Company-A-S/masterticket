"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateOrganizationModal } from "./create-organization-modal";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface OrganizationSwitcherProps {
  organizations: Organization[];
  activeOrganization: Organization | null;
}

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
}: OrganizationSwitcherProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);

  const handleOrganizationChange = async (organizationId: string) => {
    if (!organizationId) return;

    setIsChanging(true);
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      // The page will refresh or re-render due to the active organization change
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          disabled={isChanging}
          value={activeOrganization?.id || ""}
          onValueChange={handleOrganizationChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  {org.logo && (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="h-4 w-4 rounded-full"
                    />
                  )}
                  <span>{org.name}</span>
                </div>
              </SelectItem>
            ))}
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setShowCreateOrgModal(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>

      <CreateOrganizationModal
        isOpen={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
      />
    </>
  );
}
