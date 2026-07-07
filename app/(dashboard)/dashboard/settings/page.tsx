"use client";

import { useEffect, useState } from "react";
import { useUser, useUpdateProfile, useChangePassword } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: user, isLoading } = useUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Populate profile info
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBusinessName(user.businessName || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !businessName.trim()) {
      toast.error("Validation error", "All fields except phone are required");
      return;
    }
    updateProfile.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Validation error", "Please enter your current password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Validation error", "New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Validation error", "Passwords do not match");
      return;
    }

    changePassword.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8" role="status" aria-label="Loading settings">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-border pb-2">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>

        {/* Form fields */}
        <div className="mt-6 max-w-lg space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          ))}
          <Skeleton className="h-9 w-32 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account profile and security preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-border">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer",
            activeTab === "profile"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer",
            activeTab === "security"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Security & Password
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6 max-w-lg">
        {activeTab === "profile" ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Doe Retail Enterprises"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={updateProfile.isPending}>
                Save Profile
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordStrength password={newPassword} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={changePassword.isPending}>
                Change Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
