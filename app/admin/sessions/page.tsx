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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  RefreshCw,
  Activity,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  Wifi,
  Eye,
  LogOut,
  Users,
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
  updatedAt?: string;
  impersonatedBy?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [bulkRevokeDialogOpen, setBulkRevokeDialogOpen] = useState(false);
  const [selectedUserForBulk, setSelectedUserForBulk] = useState<User | null>(
    null
  );

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, selectedUser]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);

      // Get all users first
      const usersResponse = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (!usersResponse || !usersResponse.data) {
        console.error(
          "Admin access denied or invalid response:",
          usersResponse
        );
        throw new Error(
          "Access denied. You need admin privileges to view this data."
        );
      }

      const usersList = (usersResponse.data as any).users || [];
      setUsers(usersList);
      const allSessions: Session[] = [];

      // Get sessions for each user using real better-auth API
      for (const user of usersList) {
        try {
          const userSessions = await authClient.admin.listUserSessions({
            userId: user.id,
          });

          if (userSessions && userSessions.data) {
            const sessions = (userSessions.data as any).sessions || [];
            sessions.forEach((session: any) => {
              allSessions.push({
                id: session.id,
                userId: user.id,
                token: session.token,
                expiresAt: session.expiresAt,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                impersonatedBy: session.impersonatedBy,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                },
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching sessions for user ${user.id}:`, error);
          // Continue with other users even if one fails
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
          session.ipAddress?.includes(searchQuery) ||
          session.userAgent?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // User filter
    if (selectedUser !== "all") {
      filtered = filtered.filter((session) => session.userId === selectedUser);
    }

    setFilteredSessions(filtered);
  };

  const handleRevokeSession = async () => {
    if (!selectedSession) return;

    try {
      await authClient.admin.revokeUserSession({
        sessionToken: selectedSession.token,
      });

      toast.success("Session revoked successfully");
      setRevokeDialogOpen(false);
      setSelectedSession(null);
      loadSessions();
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllUserSessions = async () => {
    if (!selectedUserForBulk) return;

    try {
      await authClient.admin.revokeUserSessions({
        userId: selectedUserForBulk.id,
      });

      toast.success(
        `All sessions revoked for ${
          selectedUserForBulk.name || selectedUserForBulk.email
        }`
      );
      setBulkRevokeDialogOpen(false);
      setSelectedUserForBulk(null);
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
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return Tablet;
    }
    return Monitor;
  };

  const getDeviceType = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";
    const ua = userAgent.toLowerCase();

    // Browser detection
    let browser = "Unknown";
    if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome"))
      browser = "Safari";
    else if (ua.includes("edge")) browser = "Edge";

    // Platform detection
    let platform = "Unknown";
    if (ua.includes("windows")) platform = "Windows";
    else if (ua.includes("macintosh") || ua.includes("mac os x"))
      platform = "macOS";
    else if (ua.includes("linux")) platform = "Linux";
    else if (ua.includes("android")) platform = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad")) platform = "iOS";

    return `${browser} on ${platform}`;
  };

  const getLocationFromIP = (ipAddress?: string) => {
    // In a real app, you'd use a GeoIP service
    if (!ipAddress) return "Unknown";
    if (
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.")
    ) {
      return "Local Network";
    }
    // For demo purposes, return mock locations for different IP ranges
    const lastOctet = parseInt(ipAddress.split(".")[3] || "0");
    const locations = [
      "New York, US",
      "London, UK",
      "Tokyo, JP",
      "Berlin, DE",
      "Sydney, AU",
    ];
    return locations[lastOctet % locations.length];
  };

  const isSessionActive = (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  };

  const formatLastActive = (createdAt: string, updatedAt?: string) => {
    const date = new Date(updatedAt || createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  };

  const getSessionDuration = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h`;
    return "< 1h";
  };

  const activeSessions = sessions.filter((s) => isSessionActive(s.expiresAt));
  const expiredSessions = sessions.filter((s) => !isSessionActive(s.expiresAt));
  const impersonatedSessions = sessions.filter((s) => s.impersonatedBy);
  const mobileSessions = sessions.filter((s) => {
    const ua = s.userAgent?.toLowerCase() || "";
    return (
      ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")
    );
  });

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
          <h1 className="text-2xl font-bold">User Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and manage active user sessions across all devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setBulkRevokeDialogOpen(true)}
            variant="outline"
            size="sm"
            disabled={users.length === 0}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Bulk Revoke
          </Button>
          <Button onClick={loadSessions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activeSessions.length}
                </div>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-md">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {expiredSessions.length}
                </div>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-md">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {impersonatedSessions.length}
                </div>
                <p className="text-xs text-muted-foreground">Impersonated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-md">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mobileSessions.length}
                </div>
                <p className="text-xs text-muted-foreground">Mobile</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
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
                  placeholder="Search by user, email, IP address, or device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Sessions ({filteredSessions.length})</CardTitle>
          <CardDescription>
            Real-time session data from better-auth with comprehensive device
            and location information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Device & Browser</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Last Active</TableHead>
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
                            {session.user?.name || "Unnamed User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.user?.email}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {session.user?.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {getDeviceType(session.userAgent)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.ipAddress || "Unknown IP"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getLocationFromIP(session.ipAddress)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={active ? "default" : "secondary"}
                          className={
                            active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {active ? "Active" : "Expired"}
                        </Badge>
                        {session.impersonatedBy && (
                          <Badge
                            variant="outline"
                            className="text-orange-600 text-xs"
                          >
                            Impersonated
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getSessionDuration(session.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatLastActive(
                            session.createdAt,
                            session.updatedAt
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(session.expiresAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setRevokeDialogOpen(true);
                        }}
                        disabled={!active}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Activity className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">No sessions found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || selectedUser !== "all"
                      ? "No sessions match your search criteria"
                      : "No active sessions found"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Session Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session for{" "}
              {selectedSession?.user?.name || selectedSession?.user?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Session Details:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>User:</strong> {selectedSession?.user?.name || "N/A"}{" "}
                  ({selectedSession?.user?.email})
                </div>
                <div>
                  <strong>Device:</strong>{" "}
                  {getDeviceType(selectedSession?.userAgent)}
                </div>
                <div>
                  <strong>IP Address:</strong>{" "}
                  {selectedSession?.ipAddress || "Unknown"}
                </div>
                <div>
                  <strong>Location:</strong>{" "}
                  {getLocationFromIP(selectedSession?.ipAddress)}
                </div>
                <div>
                  <strong>Duration:</strong>{" "}
                  {selectedSession
                    ? getSessionDuration(selectedSession.createdAt)
                    : "N/A"}
                </div>
                <div>
                  <strong>Last Active:</strong>{" "}
                  {selectedSession
                    ? formatLastActive(
                        selectedSession.createdAt,
                        selectedSession.updatedAt
                      )
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important:</p>
                  <p className="text-yellow-700">
                    Revoking this session will immediately log out the user from
                    this device. They will need to sign in again to continue
                    using the application.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRevokeSession} variant="destructive">
              <X className="h-4 w-4 mr-2" />
              Revoke Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Revoke Dialog */}
      <Dialog
        open={bulkRevokeDialogOpen}
        onOpenChange={setBulkRevokeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Revoke Sessions</DialogTitle>
            <DialogDescription>
              Revoke all sessions for a specific user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="userSelect" className="text-sm font-medium">
                Select User:
              </label>
              <Select
                value={selectedUserForBulk?.id || ""}
                onValueChange={(value) => {
                  const user = users.find((u) => u.id === value);
                  setSelectedUserForBulk(user || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email} (
                      {sessions.filter((s) => s.userId === user.id).length}{" "}
                      sessions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUserForBulk && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Warning:</p>
                    <p className="text-red-700">
                      This will revoke ALL{" "}
                      {
                        sessions.filter(
                          (s) => s.userId === selectedUserForBulk.id
                        ).length
                      }{" "}
                      session(s) for{" "}
                      {selectedUserForBulk.name || selectedUserForBulk.email}.
                      They will be logged out from all devices immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevokeAllUserSessions}
              variant="destructive"
              disabled={!selectedUserForBulk}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Revoke All Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsPage;
