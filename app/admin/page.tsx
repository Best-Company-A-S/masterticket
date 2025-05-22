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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Activity,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
  recentSignups: number;
  activeSessions: number;
}

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    adminUsers: 0,
    recentSignups: 0,
    activeSessions: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get all users to calculate stats
      const usersResponse = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      // Handle the response safely
      if (!usersResponse || !usersResponse.data) {
        // If we get a 403, it means the user doesn't have admin privileges
        console.error(
          "Admin access denied or invalid response:",
          usersResponse
        );
        throw new Error(
          "Access denied. You need admin privileges to view this data."
        );
      }

      const users = (usersResponse.data as any).users || [];

      // Calculate stats
      const totalUsers = users.length;
      const bannedUsers = users.filter((user: User) => user.banned).length;
      const adminUsers = users.filter(
        (user: User) => user.role === "admin" || user.role === "superadmin"
      ).length;
      const activeUsers = totalUsers - bannedUsers;

      // Recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSignups = users.filter(
        (user: User) => new Date(user.createdAt) > sevenDaysAgo
      ).length;

      setStats({
        totalUsers,
        activeUsers,
        bannedUsers,
        adminUsers,
        recentSignups,
        activeSessions: 0, // This would require session data
      });

      // Get recent users (last 10)
      const sortedUsers = users
        .sort(
          (a: User, b: User) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10);

      setRecentUsers(sortedUsers);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create User",
      description: "Add a new user to the system",
      href: "/admin/create-user",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Manage Users",
      description: "View and manage all users",
      href: "/admin/users",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "View Sessions",
      description: "Monitor active user sessions",
      href: "/admin/sessions",
      icon: Activity,
      color: "bg-orange-500",
    },
    {
      title: "Banned Users",
      description: "Manage banned user accounts",
      href: "/admin/banned",
      icon: UserX,
      color: "bg-red-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentSignups} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.bannedUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.bannedUsers / stats.totalUsers) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.adminUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md ${action.color} text-white`}
                      >
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {user.name || "Unnamed User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                    {user.banned && <Badge variant="destructive">Banned</Badge>}
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent users
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overview of system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">User Activity</span>
                <span className="text-sm text-muted-foreground">
                  {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(stats.activeUsers / stats.totalUsers) * 100} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Admin Coverage</span>
                <span className="text-sm text-muted-foreground">
                  {((stats.adminUsers / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(stats.adminUsers / stats.totalUsers) * 100} />
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span>System operational</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span>Authentication active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <span>Admin panel functional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
