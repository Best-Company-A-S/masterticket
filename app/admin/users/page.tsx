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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Filter,
  MoreHorizontal,
  Shield,
  Ban,
  UserX,
  Eye,
  Trash2,
  User,
  RefreshCw,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface User {
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

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState("7");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (!response || !response.data) {
        // If we get a 403, it means the user doesn't have admin privileges
        console.error("Admin access denied or invalid response:", response);
        throw new Error(
          "Access denied. You need admin privileges to view this data."
        );
      }

      const usersList = (response.data as any).users || [];
      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((user) => !user.banned);
    } else if (statusFilter === "banned") {
      filtered = filtered.filter((user) => user.banned);
    }

    setFilteredUsers(filtered);
  };

  const handleSetRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      await authClient.admin.setRole({
        userId,
        role: newRole,
      });

      toast.success("User role updated successfully");
      loadUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const banExpiresIn =
        banDays === "permanent" ? undefined : parseInt(banDays) * 24 * 60 * 60;

      await authClient.admin.banUser({
        userId: selectedUser.id,
        banReason: banReason || "No reason provided",
        banExpiresIn,
      });

      toast.success("User banned successfully");
      setBanDialogOpen(false);
      setBanReason("");
      setBanDays("7");
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({ userId });
      toast.success("User unbanned successfully");
      loadUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({ userId });
      toast.success("Now impersonating user");
      // Redirect to main app or show impersonation indicator
      window.location.href = "/";
    } catch (error) {
      console.error("Error impersonating user:", error);
      toast.error("Failed to impersonate user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await authClient.admin.removeUser({ userId });
      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUsers} variant="ghost">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/create-user">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => !u.banned).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.banned).length}
            </div>
            <p className="text-xs text-muted-foreground">Banned Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {
                users.filter(
                  (u) => u.role === "admin" || u.role === "superadmin"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Admins</p>
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
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
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
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "admin" || user.role === "superadmin"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      )}
                      {!user.emailVerified && (
                        <Badge variant="outline">Unverified</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
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

                        <DropdownMenuItem
                          onClick={() => handleImpersonateUser(user.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Impersonate
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            handleSetRole(
                              user.id,
                              user.role === "admin" ? "user" : "admin"
                            )
                          }
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {user.role === "admin"
                            ? "Remove Admin"
                            : "Make Admin"}
                        </DropdownMenuItem>

                        {user.banned ? (
                          <DropdownMenuItem
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setBanDialogOpen(true);
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.name || selectedUser?.email} from the
              application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Ban Reason</Label>
              <Textarea
                id="banReason"
                placeholder="Enter reason for banning..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="banDuration">Ban Duration</Label>
              <Select value={banDays} onValueChange={setBanDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
