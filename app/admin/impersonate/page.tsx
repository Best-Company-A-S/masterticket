"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  User,
  LogOut,
  Shield,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  emailVerified: boolean;
}

const ImpersonatePage = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    loadUsers();
    checkImpersonationStatus();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadUsers = async () => {
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

      const usersList = (response.data as any).users || [];
      // Filter out banned users for impersonation
      const activeUsers = usersList.filter((user: User) => !user.banned);
      setUsers(activeUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
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
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Don't show the current user in the list
    filtered = filtered.filter((user) => user.id !== session?.user.id);

    setFilteredUsers(filtered);
  };

  const checkImpersonationStatus = () => {
    // Check if we're currently impersonating based on session data
    // This is a simplified check - in a real app you might want to check for session metadata
    setIsImpersonating(false); // This would be implemented based on your session structure
  };

  const handleImpersonateUser = async () => {
    if (!selectedUser) return;

    try {
      await authClient.admin.impersonateUser({ userId: selectedUser.id });
      toast.success(
        `Now impersonating ${selectedUser.name || selectedUser.email}`
      );
      setImpersonateDialogOpen(false);
      setSelectedUser(null);

      // Redirect to main app
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error impersonating user:", error);
      toast.error("Failed to impersonate user");
    }
  };

  const handleStopImpersonating = async () => {
    try {
      await authClient.admin.stopImpersonating();
      toast.success("Stopped impersonating user");
      setIsImpersonating(false);
      window.location.reload();
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      toast.error("Failed to stop impersonation");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl font-bold">User Impersonation</h1>
          <p className="text-muted-foreground">
            Impersonate users for support and troubleshooting
          </p>
        </div>
        <div className="flex gap-2">
          {isImpersonating && (
            <Button
              onClick={handleStopImpersonating}
              variant="destructive"
              size="sm"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Stop Impersonating
            </Button>
          )}
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Status */}
      {isImpersonating && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are currently impersonating a user. Click "Stop Impersonating"
            to return to your admin account.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Shield className="h-5 w-5" />
            Important Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 space-y-2">
          <p>
            • User impersonation should only be used for legitimate support
            purposes
          </p>
          <p>• All impersonation activities may be logged and audited</p>
          <p>• Do not access sensitive user data unless absolutely necessary</p>
          <p>• Always inform users when accessing their accounts if possible</p>
          <p>• Impersonation sessions have a limited duration for security</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Available Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Active Impersonations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-md">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">2h</div>
                <p className="text-xs text-muted-foreground">
                  Session Duration
                </p>
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
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Select a user to impersonate for support purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Joined</TableHead>
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
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.emailVerified ? "default" : "outline"}
                      className={
                        user.emailVerified ? "bg-green-100 text-green-800" : ""
                      }
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
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
                        setImpersonateDialogOpen(true);
                      }}
                      disabled={user.id === session?.user.id}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Impersonate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <User className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">No users available</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No users match your search criteria"
                      : "No users available for impersonation"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impersonation Confirmation Dialog */}
      <Dialog
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Impersonation</DialogTitle>
            <DialogDescription>
              You are about to impersonate{" "}
              {selectedUser?.name || selectedUser?.email}
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
                  <strong>Email Verified:</strong>{" "}
                  {selectedUser?.emailVerified ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Account Created:</strong>{" "}
                  {selectedUser
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-orange-700">
                <strong>Important:</strong> This action will log you in as this
                user. You'll be redirected to the main application and will see
                the app from their perspective. The session will expire after 2
                hours for security.
              </AlertDescription>
            </Alert>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Security Reminder:</p>
                  <ul className="text-red-700 mt-1 space-y-1">
                    <li>• Only use for legitimate support purposes</li>
                    <li>• Respect user privacy and data</li>
                    <li>• This action may be logged and audited</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImpersonateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImpersonateUser}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Start Impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImpersonatePage;
