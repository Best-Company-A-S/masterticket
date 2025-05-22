"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AtSign,
  Check,
  Key,
  Lock,
  LogOut,
  Shield,
  Trash2,
  User2,
} from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { data: session } = authClient.useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountData = await authClient.listAccounts();
        setAccounts(accountData.data || []);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    };

    if (session) {
      fetchAccounts();
    }
  }, [session]);

  // Update user profile information
  const handleUpdateProfile = async () => {
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      await authClient.updateUser({
        name,
        // You can add other fields here like image
      });

      toast.success("Profile updated", {
        description: "Your profile information has been updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile", {
        description: "There was an error updating your profile.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Change user email
  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;

    setIsChangingEmail(true);
    try {
      // Note: This is a simplified implementation, adjust according to your auth client API
      await authClient.changeEmail({
        newEmail,
      });

      toast.success("Verification email sent", {
        description: "Please check your email to confirm the change.",
      });
      setNewEmail("");
    } catch (error) {
      console.error("Failed to change email:", error);
      toast.error("Failed to change email", {
        description: "There was an error updating your email.",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Change user password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      toast.error("Invalid input", {
        description: "Please check your password inputs and try again.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password", {
        description: "Please check your current password and try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account unlinking
  const handleUnlinkAccount = async (
    providerId: string,
    accountId?: string
  ) => {
    try {
      await authClient.unlinkAccount({
        providerId,
        accountId,
      });

      toast.success("Account unlinked", {
        description: `Your ${providerId} account has been unlinked.`,
      });
    } catch (error) {
      console.error("Failed to unlink account:", error);
      toast.error("Failed to unlink account", {
        description:
          "This might be your only login method. Please add another method first.",
      });
    }
  };

  // Handle user deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authClient.deleteUser({
        password: deletePassword,
        callbackURL: "/login",
      });

      toast.success("Account deleted", {
        description: "Your account has been permanently deleted.",
      });

      onClose();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account", {
        description: "Please check your password and try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out", {
        description: "There was an error signing out.",
      });
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Your Profile</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="accounts">Linked Accounts</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex flex-col items-center gap-3 mb-4">
              <Avatar className="h-20 w-20">
                {session.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || ""}
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {session.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-medium">{session.user?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 bg-muted p-2 rounded-md text-sm">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  <span>{session.user?.email}</span>
                  {session.user?.emailVerified && (
                    <span className="ml-auto flex items-center text-xs text-green-600 gap-1">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleUpdateProfile}
                disabled={
                  isUpdating || !name.trim() || name === session.user?.name
                }
              >
                {isUpdating ? "Saving..." : "Save Profile"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AtSign className="h-4 w-4" /> Change Email Address
                </CardTitle>
                <CardDescription>
                  Update your email address. A verification email will be sent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="your-new-email@example.com"
                  />
                </div>
                <Button
                  onClick={handleChangeEmail}
                  disabled={
                    isChangingEmail ||
                    !newEmail.trim() ||
                    newEmail === session.user?.email
                  }
                  size="sm"
                >
                  {isChangingEmail ? "Sending..." : "Send Verification"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Change Password
                </CardTitle>
                <CardDescription>
                  Update your password. This will sign you out of other devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {newPassword &&
                    confirmPassword &&
                    newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isChangingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  size="sm"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader className="text-destructive">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your account and all
                        associated data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-2">
                      <Label htmlFor="delete-password">
                        Enter your password to confirm
                      </Label>
                      <Input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || !deletePassword}
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Linked Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Connected Accounts</h3>
              {accounts && accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account: any) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {account.provider === "credentials" ? (
                            <Key className="h-4 w-4 text-primary" />
                          ) : account.provider === "google" ? (
                            <FaGoogle className="h-4 w-4 text-primary" />
                          ) : (
                            <FaGithub className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {account.provider}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {account.provider === "credentials"
                              ? "Email & Password"
                              : `Connected on ${new Date(
                                  account.createdAt
                                ).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      {accounts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUnlinkAccount(account.provider, account.id)
                          }
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Unlink
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No linked accounts found.
                </p>
              )}

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">
                  Connect Another Account
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        // Simplified implementation, adjust to your auth client API
                        authClient.linkSocial({ provider: "google" });
                      } catch (error) {
                        toast.error("Failed to connect account");
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <FaGoogle className="h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        // Simplified implementation, adjust to your auth client API
                        authClient.linkSocial({ provider: "github" });
                      } catch (error) {
                        toast.error("Failed to connect account");
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <FaGithub className="h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out from all devices
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
