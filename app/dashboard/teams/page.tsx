"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Plus, Users } from "lucide-react";

// Define types for our team data
interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  members?: any[];
}

export default function TeamsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const { data: activeOrganization, isPending: isOrgLoading } =
    authClient.useActiveOrganization();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [organizationId, setOrganizationId] = useState<string | undefined>(
    undefined
  );
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-fetches

  // Wait for session to be loaded before doing anything
  useEffect(() => {
    if (!isSessionLoading && !session) {
      // If no session, redirect to login
      router.push("/auth/login");
    }
  }, [session, isSessionLoading, router]);

  // Set organization ID when it changes
  useEffect(() => {
    if (activeOrganization?.id && activeOrganization.id !== organizationId) {
      setOrganizationId(activeOrganization.id);
    }
  }, [activeOrganization?.id, organizationId]);

  // Define fetchTeams as a useCallback to avoid recreating it on each render
  const fetchTeams = useCallback(async () => {
    if (!organizationId || isSessionLoading || isOrgLoading || !session) return;

    try {
      setLoading(true);
      console.log("Fetching teams for organization:", organizationId);

      const response = await authClient.organization.listTeams({
        query: {
          organizationId: organizationId,
        },
      });

      console.log("Teams API response:", response);

      // Check if response is successful
      if (response) {
        // Empty response or empty array is a valid state - just means no teams yet
        if ("error" in response && response.error) {
          // Only log actual errors, not empty results
          console.error("Error fetching teams:", response.error);
          toast.error("Failed to fetch teams. Please try again.");
          setTeams([]);
        } else if ("data" in response && Array.isArray(response.data)) {
          // Handle the response format with data property
          console.log("Setting teams from data property:", response.data);
          // Type assertion to ensure the data matches our Team interface
          setTeams(response.data as Team[]);
        } else if (Array.isArray(response)) {
          // Handle direct array response
          console.log("Setting teams from array response:", response);
          setTeams(response as Team[]);
        } else {
          console.log("Unexpected response format:", response);
          setTeams([]);
        }
      } else {
        // No response at all is a problem
        console.log("No response from teams API");
        setTeams([]);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      toast.error("Failed to fetch teams. Please try again.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, isSessionLoading, isOrgLoading, session]);

  // Fetch teams when organization ID is set and session is available or refreshKey changes
  // Adding a timeout delay to prevent excessive API calls
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      if (organizationId && session && isMounted) {
        await fetchTeams();
      }
    };

    // Clear any existing timeouts first
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Debounce the fetch to prevent rapid repeated calls
    timeoutId = setTimeout(fetchData, 300);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [organizationId, refreshKey, session, fetchTeams]);

  const refreshTeams = () => {
    console.log("Refreshing teams...");
    // Add a small delay before triggering refresh to avoid multiple requests
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, 200);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !session) {
      toast.error(session ? "Team name is required" : "You must be logged in");
      return;
    }

    try {
      setLoading(true);
      const response = await authClient.organization.createTeam({
        name: teamName,
        organizationId: organizationId,
      });

      console.log("Create team response:", response);

      // Successfully created team
      setTeamName("");
      setIsCreateDialogOpen(false);
      toast.success("Team created successfully");

      // Force immediate fetch of teams - don't chain multiple fetches
      setTimeout(() => {
        refreshTeams();
      }, 500); // Use a slightly longer delay to ensure server has processed the change
    } catch (error) {
      console.error("Failed to create team:", error);
      toast.error("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!teamName.trim() || !editingTeam || !session) {
      toast.error(session ? "Team name is required" : "You must be logged in");
      return;
    }

    try {
      setLoading(true);
      const response = await authClient.organization.updateTeam({
        teamId: editingTeam.id,
        data: {
          name: teamName,
        },
      });

      // Log the response to understand its structure
      console.log("Update team response:", response);

      // More flexible response handling
      if (response) {
        if ("error" in response && response.error) {
          console.error("Failed to update team:", response.error);
          toast.error(
            "Failed to update team: " +
              (response.error?.message || "Unknown error")
          );
        } else {
          // Successfully updated team
          setTeamName("");
          setEditingTeam(null);
          setIsEditDialogOpen(false);
          toast.success("Team updated successfully");

          // Wait a moment before refreshing to allow the server to process the change
          setTimeout(() => {
            refreshTeams();
          }, 500);
        }
      } else {
        toast.error("Failed to update team. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update team:", error);
      toast.error("Failed to update team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    try {
      setLoading(true);
      const response = await authClient.organization.removeTeam({
        teamId,
        organizationId: organizationId,
      });

      // Log the response to understand its structure
      console.log("Delete team response:", response);

      // More flexible response handling
      if (response) {
        if ("error" in response && response.error) {
          console.error("Failed to delete team:", response.error);
          toast.error(
            "Failed to delete team: " +
              (response.error?.message || "Unknown error")
          );
        } else {
          // Successfully deleted team
          toast.success("Team deleted successfully");

          // Wait a moment before refreshing to allow the server to process the change
          setTimeout(() => {
            refreshTeams();
          }, 500);
        }
      } else {
        // No response means success in some APIs
        toast.success("Team deleted successfully");
        setTimeout(() => {
          refreshTeams();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast.error("Failed to delete team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setIsEditDialogOpen(true);
  };

  // Show loading state while session or organization is loading
  if (isSessionLoading || isOrgLoading) {
    return (
      <div className="container p-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error if no session
  if (!session) {
    return (
      <div className="container p-12">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">Authentication Required</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Please log in to access this page
          </p>
          <Button onClick={() => router.push("/auth/login")}>Log In</Button>
        </div>
      </div>
    );
  }

  // Show error if no active organization
  if (!activeOrganization) {
    return (
      <div className="container p-12">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">No active organization</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Please select or create an organization to manage teams
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage teams in your organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team to your organization
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
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={loading}>
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team information</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-team-name">Team Name</Label>
            <Input
              id="edit-team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTeam} disabled={loading}>
              {loading ? "Updating..." : "Update Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-2 border-muted">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </CardFooter>
            </Card>
          ))
        ) : teams.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No teams found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Create your first team to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Team
            </Button>
          </div>
        ) : (
          teams.map((team) => (
            <Card
              key={team.id}
              className="overflow-hidden border-2 border-muted hover:border-primary/20 transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {team.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(team)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/teams/${team.id}`)
                        }
                      >
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{team.members?.length || 0} members</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-3">
                <Button
                  className="w-full"
                  onClick={() => router.push(`/dashboard/teams/${team.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
