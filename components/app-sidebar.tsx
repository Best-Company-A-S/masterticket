"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Building2,
  ChevronDown,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeft,
  Plus,
  Settings,
  Ticket,
  User2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";
import { FaRobot } from "react-icons/fa";
import { ProfileDialog } from "@/components/user/profile-dialog";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

export function AppSidebar() {
  const pathname = usePathname();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();
  const { data: session } = authClient.useSession();
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Navigation items
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,
    },
    {
      title: "AI Assistant",
      href: "/dashboard/ai-assistant",
      icon: FaRobot,
    },
    {
      title: "Teams",
      href: "/dashboard/teams",
      icon: Users,
    },
  ];

  // Helper function to check if a link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      // For dashboard, only be active if exactly at /dashboard
      return pathname === "/dashboard";
    }
    // For other routes, check if the path matches exactly or starts with the href followed by /
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar className="bg-background h-screen border-r shrink-0 flex flex-col">
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Building2 className="h-5 w-5" />
                <span className="font-medium truncate">
                  {activeOrganization?.name || "Select Organization"}
                </span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {organizations?.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="flex items-center gap-2"
                  onClick={() => {
                    authClient.organization.setActive({
                      organizationId: org.id,
                    });
                  }}
                >
                  {org.logo ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={org.logo} alt={org.name} />
                      <AvatarFallback>
                        {org.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span>{org.name}</span>
                  {activeOrganization?.id === org.id && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCreateOrgModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Organization</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <Link href={item.href} key={item.href} className="w-full">
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive(item.href)}>
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Link
                href="/dashboard/settings"
                className="w-full cursor-pointer"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/dashboard/settings")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center gap-2 px-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                />
                <AvatarFallback>
                  {session?.user?.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {session?.user?.email}
                </span>
              </div>
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onSelect={() => setShowProfileDialog(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User2 className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              onSelect={() => {
                authClient.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <CreateOrganizationModal
        isOpen={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
      />

      <ProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
      />
    </Sidebar>
  );
}
