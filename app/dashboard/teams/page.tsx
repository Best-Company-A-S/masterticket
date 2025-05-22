"use client";

import { useTeamContext } from "@/components/organization/team-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { useOrganization } from "@/lib/hooks/use-organization";
import {
  Copy,
  Crown,
  MoreVertical,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }>;
}

interface Invitation {
  id: string;
  code: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  team?: {
    id: string;
    name: string;
  };
  inviter: {
    name: string;
    email: string;
  };
}

export default function TeamsPage() {
  const { activeOrganization, isAdmin, isOwner, isLoading, session } =
    useOrganization({
      requireOrganization: true,
    });

  const { refreshTeams: refreshTeamContext } = useTeamContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Modal states
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState<string | null>(null);
  const [showRemoveMember, setShowRemoveMember] = useState<{
    memberId: string;
    memberName: string;
    teamName: string;
  } | null>(null);
  const [showChangeRole, setShowChangeRole] = useState<{
    memberId: string;
    memberName: string;
    currentRole: string;
    teamId: string;
  } | null>(null);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<
    string | null
  >(null);

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [newRole, setNewRole] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Toggle team expansion
  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  // Fetch teams
  const fetchTeams = async () => {
    if (!activeOrganization?.id) return;

    setLoadingTeams(true);
    try {
      const response = await fetch(
        `/api/organization/teams-with-members?organizationId=${activeOrganization.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error("Failed to load teams");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTeams(data.teams);
      } else {
        toast.error(data.error || "Failed to load teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setLoadingTeams(false);
    }
  };

  // Fetch invitations
  const fetchInvitations = async () => {
    if (!activeOrganization?.id) return;

    setLoadingInvitations(true);
    try {
      const response = await fetch(
        `/api/organization/invitations-with-details?organizationId=${activeOrganization.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error("Failed to load invitations");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
      } else {
        toast.error(data.error || "Failed to load invitations");
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (activeOrganization?.id) {
      fetchTeams();
      fetchInvitations();
    }
  }, [activeOrganization?.id]);

  // Create team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !activeOrganization?.id) return;

    setCreating(true);
    try {
      const response = await fetch("/api/organization/create-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTeamName.trim(),
          organizationId: activeOrganization.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Team created successfully! You've been added as the team owner."
        );
        setNewTeamName("");
        setShowCreateTeam(false);
        fetchTeams();
        refreshTeamContext(); // Refresh team context so sidebar updates
      } else {
        toast.error(data.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  // Generate invitation code
  const handleGenerateCode = async () => {
    if (!activeOrganization?.id) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/organization/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: activeOrganization.id,
          teamId: selectedTeamForInvite,
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
        toast.success("Invitation code generated successfully");
        fetchInvitations();
      } else {
        toast.error(data.error || "Failed to generate invitation code");
      }
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate invitation code");
    } finally {
      setGenerating(false);
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await authClient.organization.removeTeam({
        teamId,
        organizationId: activeOrganization?.id,
      });

      if (error) {
        toast.error(error.message || "Failed to delete team");
        return;
      }

      toast.success("Team deleted successfully");
      setShowDeleteTeam(null);
      fetchTeams();
      refreshTeamContext(); // Refresh team context so sidebar updates
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    }
  };

  // Remove member from team
  const handleRemoveMember = async () => {
    if (!showRemoveMember || !activeOrganization?.id) return;

    setRemoving(true);
    try {
      const response = await fetch(
        `/api/organization/remove-team-member?memberId=${
          showRemoveMember.memberId
        }&teamId=${
          teams.find((t) =>
            t.members.some((m) => m.id === showRemoveMember.memberId)
          )?.id
        }&organizationId=${activeOrganization.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowRemoveMember(null);
        fetchTeams();
        refreshTeamContext();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setRemoving(false);
    }
  };

  // Update member role
  const handleUpdateRole = async () => {
    if (!showChangeRole || !activeOrganization?.id || !newRole) return;

    setUpdatingRole(true);
    try {
      const response = await fetch("/api/organization/update-member-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          memberId: showChangeRole.memberId,
          newRole,
          teamId: showChangeRole.teamId,
          organizationId: activeOrganization.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowChangeRole(null);
        setNewRole("");
        fetchTeams();
        refreshTeamContext();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdatingRole(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard");
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  // Check if current user can manage a specific member
  const canManageMember = (member: any, teamId: string) => {
    if (!session?.user || member.user.id === session.user.id) return false; // Can't manage yourself

    // Find current user's role in this team or organization
    const team = teams.find((t) => t.id === teamId);
    const currentUserInTeam = team?.members.find(
      (m) => m.user.id === session.user.id
    );

    // If current user is not in the team, check org-level permissions
    if (!currentUserInTeam) {
      return isOwner() || isAdmin();
    }

    // Team-level permissions
    if (currentUserInTeam.role === "owner") return true;
    if (currentUserInTeam.role === "admin" && member.role === "member")
      return true;

    return false;
  };

  if (isLoading || loadingTeams) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You need admin permissions to manage teams.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage teams and members in {activeOrganization?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInviteMember(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
          <Button onClick={() => setShowCreateTeam(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <CardDescription>
                      {team.members?.length || 0} member
                      {(team.members?.length || 0) !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTeamForInvite(team.id);
                          setShowInviteMember(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite to Team
                      </DropdownMenuItem>
                      {isOwner() && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowDeleteTeam(team.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {team.members
                  ?.slice(0, expandedTeams.has(team.id) ? undefined : 3)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.image} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`${getRoleColor(member.role)}`}
                        >
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </Badge>
                        {canManageMember(member, team.id) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setShowChangeRole({
                                    memberId: member.id,
                                    memberName: member.user.name || "",
                                    currentRole: member.role,
                                    teamId: team.id,
                                  });
                                  setNewRole(member.role);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setShowRemoveMember({
                                    memberId: member.id,
                                    memberName: member.user.name || "",
                                    teamName: team.name,
                                  })
                                }
                                className="text-destructive"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  )) || []}

                {!expandedTeams.has(team.id) &&
                  (team.members?.length || 0) > 3 && (
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTeamExpansion(team.id)}
                        className="text-muted-foreground"
                      >
                        +{(team.members?.length || 0) - 3} more member
                        {(team.members?.length || 0) - 3 !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Active invitation codes that haven't been used yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations
                  .filter((inv) => inv.status === "pending")
                  .map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {invitation.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(invitation.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {invitation.team?.name || "Organization"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getRoleColor(invitation.role)}
                        >
                          {getRoleIcon(invitation.role)}
                          <span className="ml-1">{invitation.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invitation.inviter?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(invitation.code)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Team Modal */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to organize your members.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTeam}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Development Team"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog
        open={showInviteMember}
        onOpenChange={(open) => {
          setShowInviteMember(open);
          if (!open) {
            setGeneratedCode(null);
            setSelectedTeamForInvite(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Generate an invitation code to share with new members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teamSelect">Team (Optional)</Label>
              <Select
                value={selectedTeamForInvite || "organization-wide"}
                onValueChange={(value) =>
                  setSelectedTeamForInvite(
                    value === "organization-wide" ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team or leave blank for organization-wide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization-wide">
                    Organization-wide
                  </SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roleSelect">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isOwner() && <SelectItem value="owner">Owner</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {generatedCode && (
              <div className="grid gap-2">
                <Label>Generated Code</Label>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted px-3 py-2 rounded font-mono text-lg flex-1 text-center">
                    {generatedCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with the person you want to invite. It expires
                  in 48 hours.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            {!generatedCode ? (
              <Button onClick={handleGenerateCode} disabled={generating}>
                {generating ? "Generating..." : "Generate Code"}
              </Button>
            ) : (
              <Button onClick={() => setShowInviteMember(false)}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!showRemoveMember}
        onOpenChange={() => setShowRemoveMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {showRemoveMember?.memberName}
              </span>{" "}
              from the{" "}
              <span className="font-semibold">
                {showRemoveMember?.teamName}
              </span>{" "}
              team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <Dialog
        open={!!showChangeRole}
        onOpenChange={(open) => {
          if (!open) {
            setShowChangeRole(null);
            setNewRole("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for{" "}
              <span className="font-semibold">
                {showChangeRole?.memberName}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Role</Label>
              <Badge
                variant="secondary"
                className={`w-fit ${getRoleColor(
                  showChangeRole?.currentRole || ""
                )}`}
              >
                {getRoleIcon(showChangeRole?.currentRole || "")}
                <span className="ml-1 capitalize">
                  {showChangeRole?.currentRole}
                </span>
              </Badge>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isOwner() && <SelectItem value="owner">Owner</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateRole}
              disabled={
                updatingRole ||
                !newRole ||
                newRole === showChangeRole?.currentRole
              }
            >
              {updatingRole ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <AlertDialog
        open={!!showDeleteTeam}
        onOpenChange={() => setShowDeleteTeam(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be
              undone. All team members will be moved to the organization level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteTeam && handleDeleteTeam(showDeleteTeam)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
