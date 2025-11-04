"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Check, X, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CalendarStatus {
  connected: boolean;
  calendarName: string | null;
  syncedAt: string | null;
  updatedAt: string | null;
}

interface DeadlineStats {
  upcomingCount: number;
  expiredCount: number;
}

export function CalendarSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [deadlineStats, setDeadlineStats] = useState<DeadlineStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    
    // Check for success/error messages from URL params
    const calendarSuccess = searchParams.get("calendar_success");
    const calendarError = searchParams.get("calendar_error");
    
    if (calendarSuccess === "true") {
      setSuccess("Calendar connected successfully!");
      fetchStatus();
      // Remove query param from URL
      router.replace(window.location.pathname, { scroll: false });
    }
    
    if (calendarError) {
      setError(decodeURIComponent(calendarError));
      // Remove query param from URL
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/calendar/status");
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data);
        // Fetch deadline stats if connected
        if (data.connected) {
          fetchDeadlineStats();
        }
      } else {
        setError(data.error || "Failed to fetch calendar status");
      }
    } catch (err: any) {
      console.error("Error fetching calendar status:", err);
      setError("Failed to fetch calendar status");
    }
  };

  const fetchDeadlineStats = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
        const now = new Date();
        
        const upcomingCount = documents.filter((doc: any) => {
          if (!doc.expiration_date) return false;
          const expDate = new Date(doc.expiration_date);
          return expDate >= now;
        }).length;
        
        const expiredCount = documents.filter((doc: any) => {
          if (!doc.expiration_date) return false;
          const expDate = new Date(doc.expiration_date);
          return expDate < now;
        }).length;
        
        setDeadlineStats({ upcomingCount, expiredCount });
      }
    } catch (err) {
      // Silently fail - stats are nice to have but not critical
      console.error("Error fetching deadline stats:", err);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/calendar/auth?action=connect");
      const data = await response.json();

      if (response.ok && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError(data.error || "Failed to initiate calendar connection");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Error connecting calendar:", err);
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/calendar/auth?action=disconnect");
      const data = await response.json();

      if (response.ok) {
        setSuccess("Calendar disconnected successfully");
        await fetchStatus();
      } else {
        setError(data.error || "Failed to disconnect calendar");
      }
    } catch (err: any) {
      console.error("Error disconnecting calendar:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCalendar = () => {
    window.open("https://calendar.google.com", "_blank");
  };

  if (status === null) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300">
          {success}
        </div>
      )}

      {status.connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-900/20">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="font-medium text-emerald-900 dark:text-emerald-100">
                Connected to {status.calendarName || "Google Calendar"}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Expiration dates sync automatically when you edit documents
              </p>
              {deadlineStats && (
                <div className="mt-2 flex gap-4 text-xs text-emerald-600 dark:text-emerald-400">
                  {deadlineStats.upcomingCount > 0 && (
                    <span>{deadlineStats.upcomingCount} upcoming deadline{deadlineStats.upcomingCount > 1 ? "s" : ""}</span>
                  )}
                  {deadlineStats.expiredCount > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {deadlineStats.expiredCount} expired
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleViewCalendar}
              className="flex-1 border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-500 dark:border-emerald-900 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View in Google Calendar
            </Button>

            <Button
              onClick={handleDisconnect}
              disabled={isLoading}
              variant="outline"
              className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:border-red-700 dark:hover:bg-red-900/40"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          variant="outline"
          className="w-full border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Sync with calendar
            </>
          )}
        </Button>
      )}
    </div>
  );
}

