"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Building2 } from "lucide-react";

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose,
}: CreateOrganizationModalProps) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [invitationInfo, setInvitationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    // Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
    setSlug(
      value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if slug is available
      const slugCheck = await authClient.organization.checkSlug({
        slug,
      });

      if (slugCheck.error) {
        setError(slugCheck.error.message || "This slug is already taken");
        setIsLoading(false);
        return;
      }

      // Create organization
      const { data, error } = await authClient.organization.create({
        name,
        slug,
      });

      if (error) {
        setError(error.message || "Failed to create organization");
        return;
      }

      if (data) {
        // Set as active organization
        await authClient.organization.setActive({
          organizationId: data.id,
        });

        // Close modal and redirect
        onClose();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCodeChange = async (value: string) => {
    setJoinCode(value);
    setError(null);
    setInvitationInfo(null);

    if (value.length === 6) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/organization/invitation-info?code=${value}`
        );
        const data = await response.json();

        if (data.success) {
          setInvitationInfo(data.invitation);
        } else {
          setError(data.error || "Invalid invitation code");
        }
      } catch (err) {
        setError("Failed to validate invitation code");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinCode || joinCode.length !== 6) {
      setError("Please enter a valid 6-digit invitation code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/organization/join-with-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: joinCode }),
      });

      const data = await response.json();

      if (data.success) {
        // Set as active organization
        await authClient.organization.setActive({
          organizationId: invitationInfo.organization.id,
        });

        // Close modal and redirect
        onClose();
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to join organization");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Organization" : "Join Organization"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new organization to get started."
              : "Enter a 6-digit invitation code to join an organization."}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex rounded-lg border p-1 gap-1">
          <Button
            type="button"
            variant={mode === "create" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => {
              setMode("create");
              setError(null);
              setJoinCode("");
              setInvitationInfo(null);
            }}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Create
          </Button>
          <Button
            type="button"
            variant={mode === "join" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => {
              setMode("join");
              setError(null);
              setName("");
              setSlug("");
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Join
          </Button>
        </div>

        <Separator />

        {mode === "create" ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Organization Slug
                  <span className="text-xs text-muted-foreground ml-1">
                    (used in URLs)
                  </span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="acme"
                  required
                  pattern="^[a-z0-9-]+$"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="joinCode">Invitation Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={joinCode}
                    onChange={handleJoinCodeChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code shared with you
                </p>
              </div>

              {invitationInfo && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Invitation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Organization:
                      </span>
                      <span className="font-medium">
                        {invitationInfo.organization.name}
                      </span>
                    </div>
                    {invitationInfo.team && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Team:</span>
                        <span className="font-medium">
                          {invitationInfo.team.name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium capitalize">
                        {invitationInfo.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invited by:</span>
                      <span className="font-medium">
                        {invitationInfo.inviter?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading || !invitationInfo || joinCode.length !== 6}
              >
                {isLoading ? "Joining..." : "Join Organization"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
