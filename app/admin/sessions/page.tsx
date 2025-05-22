"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  X,
  Eye,
  RefreshCw,
  Activity,
  Laptop,
  Smartphone,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  impersonatedBy?: string;
  user?: {
    name?: string;
    email: string;
  };
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, statusFilter]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);

      // Get all users first to collect their sessions
      const usersResponse = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (!usersResponse || !usersResponse.data) {
        throw new Error("Invalid response from listUsers");
      }

      const users = (usersResponse.data as any).users || [];
      const allSessions: Session[] = [];

      // Get sessions for each user
      for (const user of users) {
        try {
          const userSessions = await authClient.admin.listUserSessions({
            userId: user.id,
          });

          if (userSessions && userSessions.data) {
            const sessions = (userSessions.data as any).sessions || [];
            sessions.forEach((session: any) => {
              allSessions.push({
                ...session,
                user: {
                  name: user.name,
                  email: user.email,
                },
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching sessions for user ${user.id}:`, error);
        }
      }

      setSessions(allSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (session) =>
          session.user?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          session.user?.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          session.ipAddress?.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(
        (session) => new Date(session.expiresAt) > new Date()
      );
    } else if (statusFilter === "expired") {
      filtered = filtered.filter(
        (session) => new Date(session.expiresAt) <= new Date()
      );
    } else if (statusFilter === "impersonated") {
      filtered = filtered.filter((session) => session.impersonatedBy);
    }

    setFilteredSessions(filtered);
  };

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      await authClient.admin.revokeUserSession({
        sessionToken,
      });

      toast.success("Session revoked successfully");
      loadSessions();
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllUserSessions = async (userId: string) => {
    if (
      !confirm("Are you sure you want to revoke all sessions for this user?")
    ) {
      return;
    }

    try {
      await authClient.admin.revokeUserSessions({ userId });
      toast.success("All user sessions revoked successfully");
      loadSessions();
    } catch (error) {
      console.error("Error revoking user sessions:", error);
      toast.error("Failed to revoke user sessions");
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return Globe;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return Smartphone;
    }
    return Laptop;
  };

  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";

    // Simple browser detection
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";

    return "Unknown Browser";
  };

  const isSessionActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user sessions
          </p>
        </div>
        <Button onClick={loadSessions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter((s) => isSessionActive(s.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {sessions.filter((s) => s.impersonatedBy).length}
            </div>
            <p className="text-xs text-muted-foreground">Impersonated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {sessions.filter((s) => !isSessionActive(s.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by user, email, or IP address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="impersonated">Impersonated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions ({filteredSessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.userAgent);
                const active = isSessionActive(session.expiresAt);

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {session.user?.name || "Unknown User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatUserAgent(session.userAgent)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {session.ipAddress || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={active ? "default" : "secondary"}
                          className={
                            active ? "bg-green-100 text-green-800" : ""
                          }
                        >
                          {active ? "Active" : "Expired"}
                        </Badge>
                        {session.impersonatedBy && (
                          <Badge variant="outline" className="text-orange-600">
                            Impersonated
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(session.expiresAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {active && (
                            <DropdownMenuItem
                              onClick={() => handleRevokeSession(session.token)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Revoke Session
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() =>
                              handleRevokeAllUserSessions(session.userId)
                            }
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Revoke All User Sessions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sessions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionsPage;
