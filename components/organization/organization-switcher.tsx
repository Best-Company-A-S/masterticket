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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Users,
  Building2,
  Crown,
  ShieldCheck,
  User,
  Sparkles,
} from "lucide-react";
import { CreateOrganizationModal } from "./create-organization-modal";
import { useTeamContext } from "./team-context";

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

  // Use team context for team management
  const { activeTeam, userTeams, isLoadingTeams, setActiveTeam } =
    useTeamContext();

  const handleOrganizationChange = async (organizationId: string) => {
    if (!organizationId) return;

    setIsChanging(true);
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      // Clear active team when switching organizations
      setActiveTeam(null);
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleTeamChange = (teamId: string) => {
    if (teamId === "all-teams") {
      setActiveTeam(null);
    } else {
      const team = userTeams.find((t) => t.id === teamId);
      if (team) {
        setActiveTeam(team);
      }
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <ShieldCheck className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Organization Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3 w-3" />
            Organization
          </div>
          <Select
            disabled={isChanging}
            value={activeOrganization?.id || ""}
            onValueChange={handleOrganizationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center gap-2">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-4 w-4 rounded-full"
                      />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    <span>{org.name}</span>
                  </div>
                </SelectItem>
              ))}
              <Separator className="my-1" />
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => setShowCreateOrgModal(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Team Selector */}
        {activeOrganization && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              Team Context
              {isLoadingTeams && (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-300"></div>
              )}
            </div>

            {userTeams.length > 0 ? (
              <Select
                disabled={isLoadingTeams}
                value={activeTeam?.id || "all-teams"}
                onValueChange={handleTeamChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select team context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-teams">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>All Teams</span>
                    </div>
                  </SelectItem>
                  <Separator className="my-1" />
                  {userTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{team.name}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`ml-2 text-xs ${getRoleColor(team.role)}`}
                        >
                          {getRoleIcon(team.role)}
                          <span className="ml-1">{team.role}</span>
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : !isLoadingTeams ? (
              <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>No teams assigned</span>
                </div>
              </div>
            ) : null}

            {/* Active Team Display */}
            {activeTeam && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 flex-1">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                    <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Active Team
                    </div>
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {activeTeam.name}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getRoleColor(activeTeam.role)} border`}
                >
                  {getRoleIcon(activeTeam.role)}
                  <span className="ml-1">{activeTeam.role}</span>
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateOrganizationModal
        isOpen={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
      />
    </>
  );
}
