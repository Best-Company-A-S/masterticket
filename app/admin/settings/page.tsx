"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  Users,
  Mail,
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Database,
  Server,
  Eye,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

interface SystemInfo {
  version: string;
  environment: string;
  uptime: string;
  lastBackup: string;
  activeUsers: number;
  totalUsers: number;
  bannedUsers: number;
}

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: "1.0.0",
    environment: "development",
    uptime: "2d 14h 32m",
    lastBackup: "2024-01-15 03:00:00",
    activeUsers: 156,
    totalUsers: 203,
    bannedUsers: 3,
  });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    appName: "MasterTicket",
    appDescription: "Comprehensive ticket management system",
    allowRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: true,
    sessionTimeout: "24", // hours
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requireStrongPasswords: true,
    enableIpWhitelist: false,
    allowedIpAddresses: "",
  });

  // Admin Settings
  const [adminSettings, setAdminSettings] = useState({
    defaultUserRole: "user",
    adminNotifications: true,
    auditLogging: true,
    defaultBanDuration: "7", // days
    maxImpersonationTime: "2", // hours
    adminSessionTimeout: "8", // hours
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    emailProvider: "smtp",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    enableEmailNotifications: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // In a real app, you would load these from your backend
    setIsLoading(false);
  };

  const saveGeneralSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would save to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save general settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSecuritySettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Security settings saved successfully");
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveAdminSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Admin settings saved successfully");
    } catch (error) {
      toast.error("Failed to save admin settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Email settings saved successfully");
    } catch (error) {
      toast.error("Failed to save email settings");
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Email connection test successful");
    } catch (error) {
      toast.error("Email connection test failed");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>
        <Button onClick={loadSettings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Version</Label>
              <div className="text-2xl font-bold">{systemInfo.version}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Environment</Label>
              <Badge
                variant={
                  systemInfo.environment === "production"
                    ? "destructive"
                    : "secondary"
                }
              >
                {systemInfo.environment}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uptime</Label>
              <div className="text-lg font-semibold">{systemInfo.uptime}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Backup</Label>
              <div className="text-sm">{systemInfo.lastBackup}</div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {systemInfo.activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{systemInfo.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-md">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {systemInfo.bannedUsers}
                </div>
                <p className="text-xs text-muted-foreground">Banned Users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={generalSettings.appName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        appName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appDescription">
                    Application Description
                  </Label>
                  <Input
                    id="appDescription"
                    value={generalSettings.appDescription}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        appDescription: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.allowRegistration}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({
                        ...generalSettings,
                        allowRegistration: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      New users must verify their email address
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({
                        ...generalSettings,
                        requireEmailVerification: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-orange-600">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict access to administrators only
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({
                        ...generalSettings,
                        maintenanceMode: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveGeneralSettings} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (hours)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        maxLoginAttempts: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">
                    Minimum Password Length
                  </Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        passwordMinLength: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        enableTwoFactor: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce special characters and mixed case
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireStrongPasswords}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        requireStrongPasswords: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict admin access to specific IP addresses
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableIpWhitelist}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        enableIpWhitelist: checked,
                      })
                    }
                  />
                </div>
              </div>

              {securitySettings.enableIpWhitelist && (
                <div className="space-y-2">
                  <Label htmlFor="allowedIps">Allowed IP Addresses</Label>
                  <Textarea
                    id="allowedIps"
                    placeholder="192.168.1.1&#10;10.0.0.1&#10;..."
                    value={securitySettings.allowedIpAddresses}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        allowedIpAddresses: e.target.value,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter one IP address per line
                  </p>
                </div>
              )}

              <Button onClick={saveSecuritySettings} disabled={isLoading}>
                <Lock className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Settings */}
        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure administrative features and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultUserRole">Default User Role</Label>
                  <Select
                    value={adminSettings.defaultUserRole}
                    onValueChange={(value) =>
                      setAdminSettings({
                        ...adminSettings,
                        defaultUserRole: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultBanDuration">
                    Default Ban Duration (days)
                  </Label>
                  <Input
                    id="defaultBanDuration"
                    type="number"
                    value={adminSettings.defaultBanDuration}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        defaultBanDuration: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxImpersonationTime">
                    Max Impersonation Time (hours)
                  </Label>
                  <Input
                    id="maxImpersonationTime"
                    type="number"
                    value={adminSettings.maxImpersonationTime}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        maxImpersonationTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminSessionTimeout">
                    Admin Session Timeout (hours)
                  </Label>
                  <Input
                    id="adminSessionTimeout"
                    type="number"
                    value={adminSettings.adminSessionTimeout}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        adminSessionTimeout: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Admin Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for admin events
                    </p>
                  </div>
                  <Switch
                    checked={adminSettings.adminNotifications}
                    onCheckedChange={(checked) =>
                      setAdminSettings({
                        ...adminSettings,
                        adminNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all administrative actions
                    </p>
                  </div>
                  <Switch
                    checked={adminSettings.auditLogging}
                    onCheckedChange={(checked) =>
                      setAdminSettings({
                        ...adminSettings,
                        auditLogging: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveAdminSettings} disabled={isLoading}>
                <Shield className="h-4 w-4 mr-2" />
                Save Admin Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email delivery and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpHost: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPort: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    placeholder="your-email@gmail.com"
                    value={emailSettings.smtpUsername}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpUsername: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    placeholder="••••••••"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    placeholder="noreply@yourapp.com"
                    value={emailSettings.fromEmail}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    placeholder="MasterTicket"
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send system notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailSettings.enableEmailNotifications}
                  onCheckedChange={(checked) =>
                    setEmailSettings({
                      ...emailSettings,
                      enableEmailNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveEmailSettings} disabled={isLoading}>
                  <Mail className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
                <Button
                  onClick={testEmailConnection}
                  variant="outline"
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Actions
          </CardTitle>
          <CardDescription>Perform system maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={clearCache} variant="outline" disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
