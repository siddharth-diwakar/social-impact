"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Clock, Heart, Bookmark } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActivityItem = {
  id: string;
  type: "post" | "reply";
  title?: string;
  content: string;
  created_at: string;
  like_count?: number;
  reply_count?: number;
  post_id?: string;
  post_title?: string;
};

interface UserActivityFeedProps {
  userId: string;
  limit?: number;
}

export function UserActivityFeed({ userId, limit = 10 }: UserActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/profile/activity?userId=${userId}&limit=${limit}`);
        if (!response.ok) {
          throw new Error("Failed to fetch activity");
        }
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err: any) {
        setError(err.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, limit]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardContent className="p-8 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading activity...</p>
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
          Recent Activity
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
          Your recent forum posts and replies ({activities.length} items)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No activity yet. Start engaging with the community!
            </p>
            <Link
              href="/Community"
              className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-200"
            >
              Browse Community →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-700"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    {activity.type === "post" ? (
                      <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          activity.type === "post"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }
                      >
                        {activity.type === "post" ? "Post" : "Reply"}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                    {activity.type === "post" ? (
                      <Link
                        href={`/Community/${activity.id}`}
                        className="block hover:underline"
                      >
                        <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                          {activity.title}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {truncateContent(activity.content)}
                        </p>
                      </Link>
                    ) : (
                      <div>
                        {activity.post_id && activity.post_title ? (
                          <Link
                            href={`/Community/${activity.post_id}`}
                            className="block hover:underline"
                          >
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              Replied to: {activity.post_title}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {truncateContent(activity.content)}
                            </p>
                          </Link>
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {truncateContent(activity.content)}
                          </p>
                        )}
                      </div>
                    )}
                    {activity.type === "post" && (
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {activity.like_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {activity.like_count}
                          </span>
                        )}
                        {activity.reply_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {activity.reply_count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activities.length >= limit && (
              <div className="pt-4 text-center">
                <Link
                  href="/Community"
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-200"
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

