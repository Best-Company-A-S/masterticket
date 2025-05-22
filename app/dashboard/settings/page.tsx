"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/lib/hooks/use-organization";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CheckCircle, Trash } from "lucide-react";

export default function SettingsPage() {
  const { activeOrganization, isLoading } = useOrganization();
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState(
    activeOrganization?.name || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // Update organization name
  const handleUpdateOrganization = async () => {
    if (!activeOrganization || !organizationName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await authClient.organization.update({
        organizationId: activeOrganization.id,
        data: {
          name: organizationName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Organization updated", {
        description: "Your organization settings have been saved.",
      });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast.error("Failed to update", {
        description: "There was an error updating your organization settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete organization
  const handleDeleteOrganization = async () => {
    if (!activeOrganization) return;

    setIsDeleting(true);
    try {
      const { error } = await authClient.organization.delete({
        organizationId: activeOrganization.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Organization deleted", {
        description: "Your organization has been permanently deleted.",
      });

      // Redirect to dashboard or login
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast.error("Failed to delete", {
        description: "There was an error deleting your organization.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Update notification settings
  const handleNotificationToggle = async (enabled: boolean) => {
    if (!activeOrganization) return;

    setEnableNotifications(enabled);
    try {
      const { error } = await authClient.organization.update({
        organizationId: activeOrganization.id,
        data: {
          metadata: {
            notifications: enabled,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Notification settings updated", {
        description: enabled
          ? "You will now receive notifications for this organization"
          : "Notifications for this organization have been disabled",
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error("Failed to update settings", {
        description: "There was an error updating your notification settings.",
      });
      // Revert UI state if the API call failed
      setEnableNotifications(!enabled);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>No organization selected. Please select an organization first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization settings and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Update your organization information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization Name</Label>
              <Input
                id="organization-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>

            <div className="space-y-2">
              <Label>Organization ID</Label>
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md text-sm">
                <code>{activeOrganization.id}</code>
              </div>
              <p className="text-xs text-muted-foreground">
                This is your unique organization identifier
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpdateOrganization}
              disabled={
                isSaving || organizationName === activeOrganization.name
              }
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">
                    Organization Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about ticket updates and team activity
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={enableNotifications}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader className="text-destructive">
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Actions that can&apos;t be undone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Delete this organization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete this organization and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the organization &quot;{activeOrganization.name}&quot; and
                      all associated tickets and data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteOrganization}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
