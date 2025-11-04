"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface PreferencesFormProps {
  initialData: any;
}

export function PreferencesForm({
  initialData,
}: PreferencesFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    notificationPreferences: initialData?.notificationPreferences || "email",
    complianceAlertFrequency: initialData?.complianceAlertFrequency || "weekly",
    preferredCommunication: initialData?.preferredCommunication || "email",
    privacySettings: initialData?.privacySettings || "public",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        notificationPreferences:
          initialData.notificationPreferences || "email",
        complianceAlertFrequency:
          initialData.complianceAlertFrequency || "weekly",
        preferredCommunication:
          initialData.preferredCommunication || "email",
        privacySettings: initialData.privacySettings || "public",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preferences");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Preferences & Settings
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
          Customize your notification and privacy preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Preferences updated successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Notification Preferences
            </Label>
            <Select
              value={formData.notificationPreferences}
              onValueChange={(value) =>
                handleChange("notificationPreferences", value)
              }
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-emerald-200 bg-white text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-500/40 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notifications</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Compliance Alert Frequency
            </Label>
            <Select
              value={formData.complianceAlertFrequency}
              onValueChange={(value) =>
                handleChange("complianceAlertFrequency", value)
              }
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-emerald-200 bg-white text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-500/40 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="as-needed">As Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Preferred Communication Method
            </Label>
            <Select
              value={formData.preferredCommunication}
              onValueChange={(value) =>
                handleChange("preferredCommunication", value)
              }
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-emerald-200 bg-white text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-500/40 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Privacy Settings
            </Label>
            <Select
              value={formData.privacySettings}
              onValueChange={(value) => handleChange("privacySettings", value)}
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-emerald-200 bg-white text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-500/40 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

