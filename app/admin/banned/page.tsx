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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Ban,
  UserCheck,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface BannedUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  emailVerified: boolean;
}

const BannedUsersPage = () => {
  const [users, setUsers] = useState<BannedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<BannedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<BannedUser | null>(null);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);

  useEffect(() => {
    loadBannedUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadBannedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (!response || !response.data) {
        console.error("Admin access denied or invalid response:", response);
        throw new Error(
          "Access denied. You need admin privileges to view this data."
        );
      }

      const allUsers = (response.data as any).users || [];
      // Filter only banned users
      const bannedUsers = allUsers.filter((user: BannedUser) => user.banned);
      setUsers(bannedUsers);
    } catch (error) {
      console.error("Error loading banned users:", error);
      toast.error("Failed to load banned users");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.banReason?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      await authClient.admin.unbanUser({ userId: selectedUser.id });
      toast.success("User unbanned successfully");
      setUnbanDialogOpen(false);
      setSelectedUser(null);
      loadBannedUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const isExpired = (banExpires?: string) => {
    if (!banExpires) return false;
    return new Date(banExpires) <= new Date();
  };

  const formatBanExpires = (banExpires?: string) => {
    if (!banExpires) return "Permanent";

    const expiryDate = new Date(banExpires);
    const now = new Date();

    if (expiryDate <= now) {
      return "Expired";
    }

    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day remaining";
    if (diffDays < 30) return `${diffDays} days remaining`;

    return expiryDate.toLocaleDateString();
  };

  const getBanStatusColor = (user: BannedUser) => {
    if (!user.banExpires) return "bg-red-100 text-red-800"; // Permanent
    if (isExpired(user.banExpires)) return "bg-orange-100 text-orange-800"; // Expired
    return "bg-red-100 text-red-800"; // Active
  };

  const getBanStatusText = (user: BannedUser) => {
    if (!user.banExpires) return "Permanent Ban";
    if (isExpired(user.banExpires)) return "Expired Ban";
    return "Active Ban";
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
          <h1 className="text-2xl font-bold">Banned Users</h1>
          <p className="text-muted-foreground">
            Manage and review banned user accounts
          </p>
        </div>
        <Button onClick={loadBannedUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-md">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Total Banned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-md">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {
                    users.filter(
                      (u) => u.banExpires && !isExpired(u.banExpires)
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Active Bans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-md">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {users.filter((u) => !u.banExpires).length}
                </div>
                <p className="text-xs text-muted-foreground">Permanent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-md">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {
                    users.filter((u) => u.banExpires && isExpired(u.banExpires))
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search banned users by name, email, or ban reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banned Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banned Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Users who have been banned from the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Ban Status</TableHead>
                <TableHead>Ban Reason</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Banned On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.name || "Unnamed User"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBanStatusColor(user)}>
                      {getBanStatusText(user)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">
                        {user.banReason || "No reason provided"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.banExpires ? (
                        <>
                          {isExpired(user.banExpires) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="text-sm">
                            {formatBanExpires(user.banExpires)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Permanent</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setUnbanDialogOpen(true);
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Unban
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div>
                  <h3 className="font-medium">No banned users</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No users match your search criteria"
                      : "All users are currently active"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unban Confirmation Dialog */}
      <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban{" "}
              {selectedUser?.name || selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">User Details:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {selectedUser?.name || "N/A"}
                </div>
                <div>
                  <strong>Email:</strong> {selectedUser?.email}
                </div>
                <div>
                  <strong>Role:</strong> {selectedUser?.role}
                </div>
                <div>
                  <strong>Ban Reason:</strong>{" "}
                  {selectedUser?.banReason || "No reason provided"}
                </div>
                <div>
                  <strong>Ban Expires:</strong>{" "}
                  {formatBanExpires(selectedUser?.banExpires)}
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important:</p>
                  <p className="text-yellow-700">
                    Unbanning this user will restore their full access to the
                    application. Make sure this action is appropriate.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnbanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnbanUser}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannedUsersPage;
