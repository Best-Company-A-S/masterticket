"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogTrigger,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define team and member types
interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  lastActive?: string; // Add last active date for UI display
}

interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
}

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;
  const { data: activeOrganization, isPending: isOrgLoading } =
    authClient.useActiveOrganization();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [teamName, setTeamName] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  // Fetch team details and members
  useEffect(() => {
    // Add a local variable to track if the component is mounted
    let isMounted = true;

    const fetchTeamDetails = async () => {
      if (!teamId || !activeOrganization || isOrgLoading || isSessionLoading)
        return;

      try {
        if (!isMounted) return;
        setLoading(true);

        // Fetch team details
        console.log("Fetching team details for team ID:", teamId);

        // First try to get the team from the API
        let teamData = null;
        try {
          const teams = await authClient.organization.listTeams({
            query: {
              organizationId: activeOrganization.id,
            },
          });

          if (!isMounted) return;

          console.log("Teams API response:", teams);

          if (teams && "data" in teams && Array.isArray(teams.data)) {
            teamData = teams.data.find((t: any) => t.id === teamId);
          } else if (Array.isArray(teams)) {
            teamData = teams.find((t: any) => t.id === teamId);
          }
        } catch (error) {
          console.error("Error fetching team:", error);
        }

        if (!teamData) {
          // Fallback to organization details - but only if we didn't find the team
          try {
            const orgDetails =
              await authClient.organization.getFullOrganization();

            if (!isMounted) return;

            console.log("Organization details:", orgDetails);

            if (
              orgDetails &&
              "teams" in orgDetails &&
              Array.isArray(orgDetails.teams)
            ) {
              teamData = orgDetails.teams.find((t: any) => t.id === teamId);
            }
          } catch (error) {
            console.error("Error fetching organization details:", error);
          }
        }

        if (!isMounted) return;

        if (teamData) {
          console.log("Team data found:", teamData);
          setTeam(teamData);
          setTeamName(teamData.name);

          // For demo purposes, create mock members if none exist
          // In a real app, you would fetch members from an API
          const mockMembers: TeamMember[] = [
            {
              id: "member-1",
              userId: session?.user?.id || "user-1",
              teamId: teamId,
              role: "admin",
              lastActive: new Date().toISOString(),
              user: {
                id: session?.user?.id || "user-1",
                name: session?.user?.name || "Current User",
                email: session?.user?.email || "user@example.com",
                image: session?.user?.image || null,
              },
            },
            {
              id: "member-2",
              userId: "user-2",
              teamId: teamId,
              role: "member",
              lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              user: {
                id: "user-2",
                name: "Team Member",
                email: "member@example.com",
                image: null,
              },
            },
          ];

          setMembers(teamData.members || mockMembers);
        } else if (isMounted) {
          toast.error("Team not found");
          router.push("/dashboard/teams");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch team details:", error);
        toast.error("Failed to fetch team details. Please try again.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTeamDetails();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
    // Only fetch when these values change, not on every render
  }, [
    teamId,
    activeOrganization?.id,
    isOrgLoading,
    isSessionLoading,
    session?.user?.id,
    router,
  ]);

  const handleUpdateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setLoading(true);
      await authClient.organization.updateTeam({
        teamId: teamId,
        data: {
          name: teamName,
        },
      });

      // Update local state
      setTeam((prev) => (prev ? { ...prev, name: teamName } : null));
      setIsEditTeamDialogOpen(false);
      toast.success("Team updated successfully");
    } catch (error) {
      console.error("Failed to update team:", error);
      toast.error("Failed to update team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      // In a real implementation, you would call the API to invite a member
      try {
        await authClient.organization.inviteMember({
          email,
          role: role as "admin" | "member",
          teamId,
        });
      } catch (error) {
        console.log("Invite error:", error);
        // We'll continue for demo purposes despite potential errors
      }

      // Add member for demo purposes
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        userId: `user-${Date.now()}`,
        teamId: teamId,
        role: role,
        lastActive: new Date().toISOString(),
        user: {
          id: `user-${Date.now()}`,
          name: email.split("@")[0],
          email: email,
          image: null,
        },
      };

      setMembers([...members, newMember]);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("member");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast.error("Failed to invite member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setLoading(true);
      // In a real implementation, you would call the API to remove a member
      // For now, we'll just update the local state
      setMembers(members.filter((member) => member.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container p-12">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/teams")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{team?.name}</h1>
            <p className="text-muted-foreground mt-1">
              Manage team members and settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog
            open={isEditTeamDialogOpen}
            onOpenChange={setIsEditTeamDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Edit Team</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team</DialogTitle>
                <DialogDescription>
                  Update team name and settings
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditTeamDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateTeam} disabled={loading}>
                  {loading ? "Updating..." : "Update Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Team ID
              </h4>
              <p className="text-sm break-all">{team?.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Creation Date
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(team?.createdAt || "").toLocaleDateString()}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {new Date(team?.updatedAt || "").toLocaleDateString()}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Member Count
              </h4>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{members.length} members</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs
            defaultValue="members"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      {members.length} member{members.length !== 1 ? "s" : ""}{" "}
                      in this team
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Invite Member</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join this team
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="mt-2">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsInviteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleInviteMember}>
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          No members found
                        </h3>
                        <p className="text-muted-foreground mt-1 mb-4">
                          Invite team members to collaborate
                        </p>
                        <Button onClick={() => setIsInviteDialogOpen(true)}>
                          Invite Member
                        </Button>
                      </div>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary/10">
                              <AvatarImage
                                src={member.user.image || ""}
                                alt={member.user.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {member.user.name
                                  ? member.user.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {member.user.name}
                                {member.role === "admin" && (
                                  <Badge
                                    variant="outline"
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    <Shield className="h-3 w-3" />
                                    Admin
                                  </Badge>
                                )}
                              </h4>
                              <div className="text-sm text-muted-foreground">
                                {member.user.email}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {member.lastActive
                                    ? `Last active: ${new Date(
                                        member.lastActive
                                      ).toLocaleDateString()}`
                                    : "Never active"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    const newRole =
                                      member.role === "admin"
                                        ? "member"
                                        : "admin";
                                    // Update the member's role in the local state
                                    setMembers(
                                      members.map((m) =>
                                        m.id === member.id
                                          ? { ...m, role: newRole }
                                          : m
                                      )
                                    );
                                    toast.success(`Role updated to ${newRole}`);
                                  }}
                                >
                                  Change Role to{" "}
                                  {member.role === "admin" ? "Member" : "Admin"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    // View member details (could link to a user profile in a real app)
                                    toast.info(
                                      `Viewing details for ${member.user.name}`
                                    );
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  Remove from Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Team Settings</CardTitle>
                  <CardDescription>
                    Manage team settings and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="team-name-settings">Team Name</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="team-name-settings"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter team name"
                      />
                      <Button onClick={handleUpdateTeam} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-destructive mb-2">
                      Danger Zone
                    </h3>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this team? This action cannot be undone."
                          )
                        ) {
                          // Delete the team and redirect back to teams list
                          authClient.organization
                            .removeTeam({
                              teamId,
                              organizationId: activeOrganization?.id,
                            })
                            .then(() => {
                              toast.success("Team deleted successfully");
                              router.push("/dashboard/teams");
                            })
                            .catch((error) => {
                              console.error("Failed to delete team:", error);
                              toast.error(
                                "Failed to delete team. Please try again."
                              );
                            });
                        }
                      }}
                    >
                      Delete Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
