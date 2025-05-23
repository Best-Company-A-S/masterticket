"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "@/lib/hooks/use-organization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Users, UserMinus } from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
  uniqueKey?: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  uniqueKey?: string;
}

interface AssignmentSelectorProps {
  assignedToUserId?: string | null;
  assignedToTeamId?: string | null;
  onAssignmentChange: (userId: string | null, teamId: string | null) => void;
  disabled?: boolean;
}

export default function AssignmentSelector({
  assignedToUserId,
  assignedToTeamId,
  onAssignmentChange,
  disabled = false,
}: AssignmentSelectorProps) {
  const { activeOrganization } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [assignmentType, setAssignmentType] = useState<
    "none" | "user" | "team"
  >(assignedToUserId ? "user" : assignedToTeamId ? "team" : "none");

  // Fetch members and teams
  useEffect(() => {
    const fetchData = async () => {
      if (!activeOrganization) return;

      setIsLoadingMembers(true);
      setIsLoadingTeams(true);

      try {
        // Fetch members
        const membersResponse = await fetch(
          `/api/organization/members?organizationId=${activeOrganization.id}`
        );
        const membersData = membersResponse.ok
          ? await membersResponse.json()
          : null;

        // Fetch teams
        const teamsResponse = await fetch(
          `/api/organization/teams?organizationId=${activeOrganization.id}`
        );
        const teamsData = teamsResponse.ok ? await teamsResponse.json() : null;

        if (membersData?.success) {
          // Add a unique index to each member to avoid duplicate key issues
          const uniqueMembers = membersData.members.map(
            (member: Member, index: number) => ({
              ...member,
              uniqueKey: `member-${member.id}-${index}`,
            })
          );
          setMembers(uniqueMembers);
        }

        if (teamsData?.success) {
          // Add a unique index to each team to avoid duplicate key issues
          const uniqueTeams = teamsData.teams.map(
            (team: Team, index: number) => ({
              ...team,
              uniqueKey: `team-${team.id}-${index}`,
            })
          );
          setTeams(uniqueTeams);
        }
      } catch (error) {
        console.error("Error fetching assignment data:", error);
      } finally {
        setIsLoadingMembers(false);
        setIsLoadingTeams(false);
      }
    };

    fetchData();
  }, [activeOrganization]);

  // Handle assignment type change
  const handleAssignmentTypeChange = (type: "none" | "user" | "team") => {
    setAssignmentType(type);

    if (type === "none") {
      onAssignmentChange(null, null);
    } else if (type === "user") {
      onAssignmentChange(null, null); // Clear selection
    } else if (type === "team") {
      onAssignmentChange(null, null); // Clear selection
    }
  };

  // Handle user assignment
  const handleUserAssignment = (userId: string) => {
    if (userId === "none") {
      onAssignmentChange(null, null);
    } else {
      onAssignmentChange(userId, null);
    }
  };

  // Handle team assignment
  const handleTeamAssignment = (teamId: string) => {
    if (teamId === "none") {
      onAssignmentChange(null, null);
    } else {
      onAssignmentChange(null, teamId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Assignment Type</Label>
        <Select
          value={assignmentType}
          onValueChange={handleAssignmentTypeChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose assignment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <UserMinus className="h-4 w-4" />
                <span>Unassigned</span>
              </div>
            </SelectItem>
            <SelectItem value="user">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Assign to User</span>
              </div>
            </SelectItem>
            <SelectItem value="team">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Assign to Team</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {assignmentType === "user" && (
        <div className="grid gap-2">
          <Label>Assign to User</Label>
          <Select
            value={assignedToUserId || "none"}
            onValueChange={handleUserAssignment}
            disabled={disabled || isLoadingMembers}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingMembers ? "Loading users..." : "Select a user"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4" />
                  <span>No user assigned</span>
                </div>
              </SelectItem>
              {members.map((member) => (
                <SelectItem key={member.uniqueKey} value={member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={member.image || ""}
                        alt={member.name || ""}
                      />
                      <AvatarFallback className="text-xs">
                        {member.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.name || "Unnamed User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {assignmentType === "team" && (
        <div className="grid gap-2">
          <Label>Assign to Team</Label>
          <Select
            value={assignedToTeamId || "none"}
            onValueChange={handleTeamAssignment}
            disabled={disabled || isLoadingTeams}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingTeams ? "Loading teams..." : "Select a team"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4" />
                  <span>No team assigned</span>
                </div>
              </SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.uniqueKey} value={team.id}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{team.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {team.memberCount} member
                        {team.memberCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
