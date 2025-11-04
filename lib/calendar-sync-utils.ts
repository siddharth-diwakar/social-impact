import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";

interface CalendarSyncResult {
  success: boolean;
  eventId?: string;
  action?: "created" | "updated" | "recreated";
  error?: string;
}

/**
 * Syncs a single document's expiration date to Google Calendar
 * Returns the calendar event ID if successful
 */
export async function syncDocumentToCalendar(
  documentId: string,
  filename: string,
  expirationDate: string | null,
  existingEventId?: string | null
): Promise<CalendarSyncResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if calendar is connected
    const { data: calendarSync, error: fetchError } = await supabase
      .from("calendar_sync")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !calendarSync) {
      // Calendar not connected - this is okay, just return success
      // The document will be synced when user connects calendar
      return { success: true };
    }

    // If no expiration date, we might want to delete the event if it exists
    if (!expirationDate) {
      if (existingEventId) {
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/calendar/callback`
          );

          // Check if token needs refresh
          let accessToken = calendarSync.access_token;
          const tokenExpiry = calendarSync.token_expiry
            ? new Date(calendarSync.token_expiry)
            : null;

          if (tokenExpiry && tokenExpiry <= new Date() && calendarSync.refresh_token) {
            oauth2Client.setCredentials({
              refresh_token: calendarSync.refresh_token,
            });

            const { credentials } = await oauth2Client.refreshAccessToken();
            accessToken = credentials.access_token || calendarSync.access_token;

            if (credentials.access_token) {
              await supabase
                .from("calendar_sync")
                .update({
                  access_token: credentials.access_token,
                  token_expiry: credentials.expiry_date
                    ? new Date(credentials.expiry_date)
                    : null,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);
            }
          }

          oauth2Client.setCredentials({
            access_token: accessToken,
          });

          const calendar = google.calendar({ version: "v3", auth: oauth2Client });
          const calendarId = calendarSync.calendar_id || "primary";

          // Delete the event
          await calendar.events.delete({
            calendarId,
            eventId: existingEventId,
          });

          // Clear event ID from document
          await supabase
            .from("documents")
            .update({ calendar_event_id: null })
            .eq("id", documentId);
        } catch (deleteError) {
          // Event might already be deleted - that's okay
          console.log("Event not found or already deleted:", deleteError);
        }
      }
      return { success: true };
    }

    // Check if token needs refresh
    let accessToken = calendarSync.access_token;
    const tokenExpiry = calendarSync.token_expiry
      ? new Date(calendarSync.token_expiry)
      : null;

    if (tokenExpiry && tokenExpiry <= new Date() && calendarSync.refresh_token) {
      // Refresh token
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/calendar/callback`
      );

      oauth2Client.setCredentials({
        refresh_token: calendarSync.refresh_token,
      });

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token || calendarSync.access_token;

        // Update stored token
        if (credentials.access_token) {
          await supabase
            .from("calendar_sync")
            .update({
              access_token: credentials.access_token,
              token_expiry: credentials.expiry_date
                ? new Date(credentials.expiry_date)
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        return { success: false, error: "Failed to refresh calendar token" };
      }
    }

    // Parse the date and format as YYYY-MM-DD for all-day events
    let dateString: string;
    if (typeof expirationDate === "string") {
      // If it's already a string in YYYY-MM-DD format, use it directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
        dateString = expirationDate;
      } else {
        // Extract date part from ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
        dateString = expirationDate.split("T")[0];
      }
    } else {
      // If it's a Date object or timestamp, convert to ISO and extract date part
      const eventDate = new Date(expirationDate);
      // Use UTC date components to match what was stored in the database
      const year = eventDate.getUTCFullYear();
      const month = String(eventDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(eventDate.getUTCDate()).padStart(2, "0");
      dateString = `${year}-${month}-${day}`;
    }

    const eventTitle = `${filename} - Deadline`;
    const eventDescription = `Deadline for: ${filename}`;

    // Create calendar client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/calendar/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarId = calendarSync.calendar_id || "primary";

    // Check if event already exists
    let eventId = existingEventId || null;

    if (eventId) {
      // Try to get existing event to verify it still exists
      try {
        await calendar.events.get({
          calendarId,
          eventId,
        });
        // Event exists, update it
        const updatedEvent = {
          summary: eventTitle,
          description: eventDescription,
          start: {
            date: dateString,
          },
          end: {
            date: dateString, // All-day events end on the same day
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 }, // 1 day before
              { method: "popup", minutes: 60 }, // 1 hour before
            ],
          },
        };

        await calendar.events.update({
          calendarId,
          eventId,
          requestBody: updatedEvent,
        });

        // Update synced_at timestamp
        await supabase
          .from("calendar_sync")
          .update({ synced_at: new Date().toISOString() })
          .eq("user_id", user.id);

        return { success: true, eventId, action: "updated" };
      } catch (getError: any) {
        // Event doesn't exist (404) or error accessing it, create new one
        console.log(`Event ${eventId} not found, creating new event for ${filename}`);
        eventId = null;
      }
    }

    // Create new event (or recreate if old one was deleted)
    const newEvent = {
      summary: eventTitle,
      description: eventDescription,
      start: {
        date: dateString, // All-day event
      },
      end: {
        date: dateString, // All-day events end on the same day
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 60 }, // 1 hour before
        ],
      },
    };

    const createdEvent = await calendar.events.insert({
      calendarId,
      requestBody: newEvent,
    });

    const newEventId = createdEvent.data.id;

    // Store the event ID in the database (if column exists)
    try {
      await supabase
        .from("documents")
        .update({ calendar_event_id: newEventId })
        .eq("id", documentId);
    } catch (updateError: any) {
      // Column might not exist yet - this is okay, event was still created
      console.log("Could not store calendar_event_id (column may not exist yet):", updateError.message);
    }

    // Update synced_at timestamp
    await supabase
      .from("calendar_sync")
      .update({ synced_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return {
      success: true,
      eventId: newEventId,
      action: existingEventId ? "recreated" : "created",
    };
  } catch (error: any) {
    console.error("Error syncing document to calendar:", error);
    return {
      success: false,
      error: error.message || "Failed to sync to calendar",
    };
  }
}

