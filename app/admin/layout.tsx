"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserCheck,
  Shield,
  Ban,
  Settings,
  Eye,
  UserPlus,
  Activity,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    title: "User Sessions",
    href: "/admin/sessions",
    icon: Activity,
  },
  {
    title: "Banned Users",
    href: "/admin/banned",
    icon: Ban,
  },
  {
    title: "Impersonation",
    href: "/admin/impersonate",
    icon: Eye,
  },
  {
    title: "Create User",
    href: "/admin/create-user",
    icon: UserPlus,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!session) {
    redirect("/");
  }

  // Check if user has admin role
  const userRole = session.user.role;
  const isAdmin = userRole === "admin";

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center w-full">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this area.
            </p>
            <Button asChild>
              <Link href="/">Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider className="w-full">
      <div className="flex h-screen w-full">
        <Sidebar className="border-r w-[250px]">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="font-semibold">Admin Panel</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="w-full flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col w-full">
          <main className="flex-1 p-6 overflow-auto w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
