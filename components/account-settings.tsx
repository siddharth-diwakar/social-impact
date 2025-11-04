"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface AccountSettingsProps {
  email: string;
  emailVerified: boolean;
}

export function AccountSettings({ email, emailVerified }: AccountSettingsProps) {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      setIsChangingPassword(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingEmail(true);
    setEmailError(null);
    setEmailSuccess(false);

    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      setIsChangingEmail(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      setEmailSuccess(true);
      setNewEmail("");
      setTimeout(() => {
        setEmailSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setEmailError(err.message || "Failed to change email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Change Password
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Password updated successfully!
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Change Email
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Update your account email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Label>Current Email</Label>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm text-slate-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
              <Mail className="h-4 w-4" />
              {email}
              {emailVerified && (
                <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white dark:bg-emerald-500">
                  Verified
                </span>
              )}
            </div>
          </div>
          <form onSubmit={handleEmailChange} className="space-y-4">
            {emailError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400">
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Verification email sent! Please check your inbox.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                required
              />
            </div>
            <Button type="submit" disabled={isChangingEmail}>
              {isChangingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

