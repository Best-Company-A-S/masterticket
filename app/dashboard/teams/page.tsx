"use client";

import { useOrganization } from "@/lib/hooks/use-organization";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Users,
  Plus,
  Settings,
  UserPlus,
  Copy,
  MoreVertical,
  Trash2,
  Crown,
  ShieldCheck,
  User,
} from "lucide-react";
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
  const { activeOrganization, isAdmin, isOwner, isLoading } = useOrganization({
    requireOrganization: true,
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Modal states
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState<string | null>(null);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<
    string | null
  >(null);

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      const { data, error } = await authClient.organization.createTeam({
        name: newTeamName.trim(),
        organizationId: activeOrganization.id,
      });

      if (error) {
        toast.error(error.message || "Failed to create team");
        return;
      }

      if (data) {
        toast.success("Team created successfully");
        setNewTeamName("");
        setShowCreateTeam(false);
        fetchTeams();
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
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-lg">{team.name}</CardTitle>
              </div>
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
                    <DropdownMenuItem
                      onClick={() => setShowDeleteTeam(team.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {team.members?.length || 0} member
                {(team.members?.length || 0) !== 1 ? "s" : ""}
              </CardDescription>
              <div className="space-y-2">
                {team.members?.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        {member.user.name?.charAt(0) || "?"}
                      </div>
                      <span className="text-sm truncate">
                        {member.user.name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getRoleColor(member.role)}`}
                    >
                      <span className="mr-1">{getRoleIcon(member.role)}</span>
                      {member.role}
                    </Badge>
                  </div>
                )) || []}
                {(team.members?.length || 0) > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{(team.members?.length || 0) - 3} more member
                    {(team.members?.length || 0) - 3 !== 1 ? "s" : ""}
                  </p>
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
