"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NotificationHistoryItem = {
  id: string;
  notification_type: string;
  channel: string;
  recipient: string;
  subject: string | null;
  document_id: string | null;
  deadline_date: string | null;
  reminder_days_before: number | null;
  sent_at: string;
  status: string;
  error_message: string | null;
  metadata: any;
};

interface NotificationHistoryProps {
  userId: string;
}

export function NotificationHistory({ userId }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/history?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notification history");
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (err: any) {
        setError(err.message || "Failed to load notification history");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline_reminder":
        return <Calendar className="h-4 w-4" />;
      case "weekly_digest":
        return <Mail className="h-4 w-4" />;
      case "forum_reply":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "deadline_reminder":
        return "Deadline Reminder";
      case "weekly_digest":
        return "Weekly Digest";
      case "forum_reply":
        return "Forum Reply";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardContent className="p-8 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading notification history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Notification History
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
          View all notifications sent to you ({notifications.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No notifications yet. You'll see notifications here when they're sent.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.notification_type)}
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {getNotificationTypeLabel(notification.notification_type)}
                      </span>
                      {notification.reminder_days_before && (
                        <Badge variant="outline" className="text-xs">
                          {notification.reminder_days_before} days before
                        </Badge>
                      )}
                    </div>
                    {notification.subject && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {notification.subject}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        {notification.channel === "email" ? (
                          <Mail className="h-3 w-3" />
                        ) : (
                          <MessageSquare className="h-3 w-3" />
                        )}
                        {notification.channel.toUpperCase()}
                      </span>
                      <span>To: {notification.recipient}</span>
                      <span>{formatDate(notification.sent_at)}</span>
                    </div>
                    {notification.error_message && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Error: {notification.error_message}
                      </p>
                    )}
                  </div>
                  <div>{getStatusBadge(notification.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

