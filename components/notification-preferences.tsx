"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, Bell, Mail, Phone } from "lucide-react";

interface NotificationPreferencesProps {
  userEmail?: string;
  userPhone?: string;
}

export function NotificationPreferences({
  userEmail,
  userPhone,
}: NotificationPreferencesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState({
    email_enabled: true,
    email_address: userEmail || "",
    sms_enabled: false,
    phone_number: userPhone || "",
    reminder_30_days: true,
    reminder_14_days: true,
    reminder_7_days: true,
    reminder_1_day: true,
    weekly_digest_enabled: true,
    weekly_digest_day: 1, // Monday
    weekly_digest_time: "09:00",
    reminder_channels: ["email"] as string[],
  });

  useEffect(() => {
    // Fetch current preferences
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences");
      const data = await response.json();

      if (response.ok && data.preferences) {
        setPreferences({
          email_enabled: data.preferences.email_enabled ?? true,
          email_address: data.preferences.email_address || userEmail || "",
          sms_enabled: data.preferences.sms_enabled ?? false,
          phone_number: data.preferences.phone_number || userPhone || "",
          reminder_30_days: data.preferences.reminder_30_days ?? true,
          reminder_14_days: data.preferences.reminder_14_days ?? true,
          reminder_7_days: data.preferences.reminder_7_days ?? true,
          reminder_1_day: data.preferences.reminder_1_day ?? true,
          weekly_digest_enabled: data.preferences.weekly_digest_enabled ?? true,
          weekly_digest_day: data.preferences.weekly_digest_day ?? 1,
          weekly_digest_time: data.preferences.weekly_digest_time
            ? data.preferences.weekly_digest_time.substring(0, 5)
            : "09:00",
          reminder_channels: data.preferences.reminder_channels || ["email"],
        });
      }
    } catch (err: any) {
      console.error("Error fetching preferences:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert time to HH:MM:SS format
      const timeWithSeconds = `${preferences.weekly_digest_time}:00`;

      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...preferences,
          weekly_digest_time: timeWithSeconds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preferences");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (field: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleReminderChannelToggle = (channel: string, checked: boolean) => {
    setPreferences((prev) => {
      const channels = [...(prev.reminder_channels || [])];
      if (checked && !channels.includes(channel)) {
        channels.push(channel);
      } else if (!checked) {
        return {
          ...prev,
          reminder_channels: channels.filter((c) => c !== channel),
        };
      }
      return { ...prev, reminder_channels: channels };
    });
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-emerald-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Configure how and when you receive deadline reminders and weekly
            digests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Email Settings */}
          <div className="space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-900 dark:bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                Email Notifications
              </h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_enabled">Enable Email Notifications</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive deadline reminders and weekly digests via email
                </p>
              </div>
              <Switch
                id="email_enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) =>
                  handleToggle("email_enabled", checked)
                }
              />
            </div>

            {preferences.email_enabled && (
              <div className="space-y-2">
                <Label htmlFor="email_address">Email Address</Label>
                <Input
                  id="email_address"
                  type="email"
                  value={preferences.email_address}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      email_address: e.target.value,
                    }))
                  }
                  placeholder="your@email.com"
                />
              </div>
            )}
          </div>

          {/* SMS Settings */}
          <div className="space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-900 dark:bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                SMS Notifications
              </h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_enabled">Enable SMS Notifications</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive deadline reminders via SMS (E.164 format: +1234567890)
                </p>
              </div>
              <Switch
                id="sms_enabled"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) =>
                  handleToggle("sms_enabled", checked)
                }
              />
            </div>

            {preferences.sms_enabled && (
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={preferences.phone_number}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  placeholder="+1234567890"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            )}
          </div>

          {/* Deadline Reminder Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
              Deadline Reminders
            </h3>

            <div className="space-y-2">
              <Label>Reminder Channels</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder_email"
                    checked={preferences.reminder_channels.includes("email")}
                    onCheckedChange={(checked) =>
                      handleReminderChannelToggle("email", checked === true)
                    }
                    disabled={!preferences.email_enabled}
                  />
                  <Label
                    htmlFor="reminder_email"
                    className={
                      !preferences.email_enabled ? "text-slate-400" : ""
                    }
                  >
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder_sms"
                    checked={preferences.reminder_channels.includes("sms")}
                    onCheckedChange={(checked) =>
                      handleReminderChannelToggle("sms", checked === true)
                    }
                    disabled={!preferences.sms_enabled}
                  />
                  <Label
                    htmlFor="reminder_sms"
                    className={
                      !preferences.sms_enabled ? "text-slate-400" : ""
                    }
                  >
                    SMS
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>When to send reminders:</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder_30_days" className="font-normal">
                    30 days before deadline
                  </Label>
                  <Switch
                    id="reminder_30_days"
                    checked={preferences.reminder_30_days}
                    onCheckedChange={(checked) =>
                      handleToggle("reminder_30_days", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder_14_days" className="font-normal">
                    14 days before deadline
                  </Label>
                  <Switch
                    id="reminder_14_days"
                    checked={preferences.reminder_14_days}
                    onCheckedChange={(checked) =>
                      handleToggle("reminder_14_days", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder_7_days" className="font-normal">
                    7 days before deadline
                  </Label>
                  <Switch
                    id="reminder_7_days"
                    checked={preferences.reminder_7_days}
                    onCheckedChange={(checked) =>
                      handleToggle("reminder_7_days", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder_1_day" className="font-normal">
                    1 day before deadline
                  </Label>
                  <Switch
                    id="reminder_1_day"
                    checked={preferences.reminder_1_day}
                    onCheckedChange={(checked) =>
                      handleToggle("reminder_1_day", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Digest Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly_digest_enabled">Weekly Digest</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive a weekly summary of upcoming deadlines and compliance
                  updates
                </p>
              </div>
              <Switch
                id="weekly_digest_enabled"
                checked={preferences.weekly_digest_enabled}
                onCheckedChange={(checked) =>
                  handleToggle("weekly_digest_enabled", checked)
                }
              />
            </div>

            {preferences.weekly_digest_enabled && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weekly_digest_day">Day of Week</Label>
                  <Select
                    value={preferences.weekly_digest_day.toString()}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        weekly_digest_day: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_digest_time">Time</Label>
                  <Input
                    id="weekly_digest_time"
                    type="time"
                    value={preferences.weekly_digest_time}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        weekly_digest_time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

