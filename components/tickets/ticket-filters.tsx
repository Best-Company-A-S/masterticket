"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/lib/hooks/use-organization";
import {
  Check,
  ChevronsUpDown,
  Filter,
  User,
  Users,
  UserMinus,
  Loader2,
} from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statuses = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Closed", value: "CLOSED" },
  { label: "On Hold", value: "ON_HOLD" },
];

const priorities = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

const assignmentTypes = [
  { label: "Unassigned", value: "unassigned", icon: UserMinus },
  { label: "Any User", value: "user", icon: User },
  { label: "Any Team", value: "team", icon: Users },
];

interface Member {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
}

interface TicketFiltersProps {
  onStatusChange?: (values: string[]) => void;
  onPriorityChange?: (values: string[]) => void;
  onAssignmentChange?: (values: string[]) => void;
  onSpecificUserChange?: (userId: string | null) => void;
  onSpecificTeamChange?: (teamId: string | null) => void;
}

export function TicketFilters({
  onStatusChange,
  onPriorityChange,
  onAssignmentChange,
  onSpecificUserChange,
  onSpecificTeamChange,
}: TicketFiltersProps) {
  const { activeOrganization } = useOrganization();
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [priorityOpen, setPriorityOpen] = React.useState(false);
  const [assignmentOpen, setAssignmentOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [teamOpen, setTeamOpen] = React.useState(false);

  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = React.useState<string[]>(
    []
  );
  const [selectedAssignments, setSelectedAssignments] = React.useState<
    string[]
  >([]);
  const [selectedUser, setSelectedUser] = React.useState<Member | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  const [members, setMembers] = React.useState<Member[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = React.useState(false);

  // Fetch members and teams
  React.useEffect(() => {
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
          setMembers(membersData.members);
        }

        if (teamsData?.success) {
          setTeams(teamsData.teams);
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      } finally {
        setIsLoadingMembers(false);
        setIsLoadingTeams(false);
      }
    };

    fetchData();
  }, [activeOrganization]);

  const handleStatusSelect = (value: string) => {
    const newSelectedStatuses = selectedStatuses.includes(value)
      ? selectedStatuses.filter((item) => item !== value)
      : [...selectedStatuses, value];

    setSelectedStatuses(newSelectedStatuses);
    onStatusChange?.(newSelectedStatuses);
  };

  const handlePrioritySelect = (value: string) => {
    const newSelectedPriorities = selectedPriorities.includes(value)
      ? selectedPriorities.filter((item) => item !== value)
      : [...selectedPriorities, value];

    setSelectedPriorities(newSelectedPriorities);
    onPriorityChange?.(newSelectedPriorities);
  };

  const handleAssignmentSelect = (value: string) => {
    const newSelectedAssignments = selectedAssignments.includes(value)
      ? selectedAssignments.filter((item) => item !== value)
      : [...selectedAssignments, value];

    setSelectedAssignments(newSelectedAssignments);
    onAssignmentChange?.(newSelectedAssignments);
  };

  const handleUserSelect = (user: Member | null) => {
    setSelectedUser(user);
    onSpecificUserChange?.(user?.id || null);
    setUserOpen(false);
  };

  const handleTeamSelect = (team: Team | null) => {
    setSelectedTeam(team);
    onSpecificTeamChange?.(team?.id || null);
    setTeamOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedStatuses.length}
              </Badge>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search status..." />
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={() => handleStatusSelect(status.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStatuses.includes(status.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {status.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Priority
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedPriorities.length}
              </Badge>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search priority..." />
            <CommandEmpty>No priority found.</CommandEmpty>
            <CommandGroup>
              {priorities.map((priority) => (
                <CommandItem
                  key={priority.value}
                  value={priority.value}
                  onSelect={() => handlePrioritySelect(priority.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPriorities.includes(priority.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {priority.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={assignmentOpen} onOpenChange={setAssignmentOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Assignment
            {selectedAssignments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedAssignments.length}
              </Badge>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search assignment..." />
            <CommandEmpty>No assignment found.</CommandEmpty>
            <CommandGroup>
              {assignmentTypes.map((assignment) => (
                <CommandItem
                  key={assignment.value}
                  value={assignment.value}
                  onSelect={() => handleAssignmentSelect(assignment.value)}
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAssignments.includes(assignment.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <assignment.icon className="mr-2 h-4 w-4" />
                    {assignment.label}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={userOpen} onOpenChange={setUserOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {selectedUser ? (
              <span className="truncate max-w-[100px]">
                {selectedUser.name || selectedUser.email}
              </span>
            ) : (
              "Filter by User"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : (
                <>
                  <CommandGroup heading="Users">
                    {members.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.id}
                        onSelect={() => handleUserSelect(member)}
                      >
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedUser?.id === member.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={member.image || ""}
                              alt={member.name || ""}
                            />
                            <AvatarFallback className="text-xs">
                              {member.name?.substring(0, 2).toUpperCase() ||
                                "U"}
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
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={() => handleUserSelect(null)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !selectedUser ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <UserMinus className="mr-2 h-4 w-4" />
                      Clear user filter
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={teamOpen} onOpenChange={setTeamOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {selectedTeam ? (
              <span className="truncate max-w-[100px]">
                {selectedTeam.name}
              </span>
            ) : (
              "Filter by Team"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search teams..." />
            <CommandList>
              <CommandEmpty>No teams found.</CommandEmpty>
              {isLoadingTeams ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading teams...</span>
                </div>
              ) : (
                <>
                  <CommandGroup heading="Teams">
                    {teams.map((team) => (
                      <CommandItem
                        key={team.id}
                        value={team.id}
                        onSelect={() => handleTeamSelect(team)}
                      >
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTeam?.id === team.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <Users className="h-4 w-4 mr-2" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {team.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {team.memberCount} member
                              {team.memberCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={() => handleTeamSelect(null)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !selectedTeam ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <UserMinus className="mr-2 h-4 w-4" />
                      Clear team filter
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
