"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, Mail, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CreateUserPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    emailVerified: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      await authClient.admin.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as "user" | "admin",
        data: {
          emailVerified: formData.emailVerified,
        },
      });

      toast.success("User created successfully");
      router.push("/admin/users");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role and Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose the appropriate role for this user
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailVerified"
                  checked={formData.emailVerified}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailVerified", checked as boolean)
                  }
                />
                <Label htmlFor="emailVerified" className="text-sm">
                  Mark email as verified
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • The user will receive login credentials and can change their
            password after first login
          </p>
          <p>
            • Admin users have full access to the admin panel and can manage
            other users
          </p>
          <p>
            • Regular users have standard application access without admin
            privileges
          </p>
          <p>
            • Email verification can be done now or the user can verify later
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;
