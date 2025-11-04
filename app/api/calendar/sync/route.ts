import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get calendar sync record
    const { data: calendarSync, error: fetchError } = await supabase
      .from("calendar_sync")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !calendarSync) {
      return NextResponse.json(
        { error: "Calendar not connected. Please connect your Google Calendar first." },
        { status: 400 }
      );
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
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/calendar/callback`
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
        return NextResponse.json(
          { error: "Failed to refresh calendar token. Please reconnect." },
          { status: 401 }
        );
      }
    }

    // Get upcoming deadlines from the database
    // Note: calendar_event_id may not exist if migration hasn't been run yet
    const { data: deadlines, error: deadlinesError } = await supabase
      .from("documents")
      .select("id, filename, expiration_date, linked_deadline_id")
      .eq("user_id", user.id)
      .not("expiration_date", "is", null);

    if (deadlinesError) {
      console.error("Error fetching deadlines:", deadlinesError);
      return NextResponse.json(
        { error: "Failed to fetch deadlines. Please ensure the database migration has been run." },
        { status: 500 }
      );
    }

    // Try to fetch calendar_event_id separately if the column exists
    // This handles the case where the migration hasn't been run yet
    let deadlinesWithEventIds = deadlines?.map((doc) => ({ ...doc, calendar_event_id: null })) || [];
    
    // Check if calendar_event_id column exists by trying to select it
    const { data: docsWithEventIds, error: eventIdError } = await supabase
      .from("documents")
      .select("id, calendar_event_id")
      .eq("user_id", user.id)
      .not("expiration_date", "is", null);

    // If the column exists, merge the event IDs
    if (!eventIdError && docsWithEventIds) {
      const eventIdMap = new Map(docsWithEventIds.map(doc => [doc.id, doc.calendar_event_id]));
      deadlinesWithEventIds = deadlinesWithEventIds.map(doc => ({
        ...doc,
        calendar_event_id: eventIdMap.get(doc.id) || null,
      }));
    }

    // Create calendar client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/calendar/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarId = calendarSync.calendar_id || "primary";

    // Sync deadlines to calendar
    const syncedEvents = [];
    for (const deadline of deadlinesWithEventIds) {
      if (!deadline.expiration_date) continue;

      // Parse the date and format as YYYY-MM-DD for all-day events
      // Extract date part from ISO string to avoid timezone conversion issues
      let dateString: string;
      if (typeof deadline.expiration_date === "string") {
        // If it's already a string in YYYY-MM-DD format, use it directly
        if (/^\d{4}-\d{2}-\d{2}$/.test(deadline.expiration_date)) {
          dateString = deadline.expiration_date;
        } else {
          // Extract date part from ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
          dateString = deadline.expiration_date.split("T")[0];
        }
      } else {
        // If it's a Date object or timestamp, convert to ISO and extract date part
        const eventDate = new Date(deadline.expiration_date);
        // Use UTC date components to match what was stored in the database
        const year = eventDate.getUTCFullYear();
        const month = String(eventDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(eventDate.getUTCDate()).padStart(2, "0");
        dateString = `${year}-${month}-${day}`;
      }
      
      const eventTitle = `${deadline.filename} - Deadline`;
      const eventDescription = `Deadline for: ${deadline.filename}`;

      try {
        // Check if event already exists
        let eventId = deadline.calendar_event_id;
        
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

            syncedEvents.push({
              title: eventTitle,
              date: dateString,
              eventId,
              action: "updated",
            });
            continue; // Skip to next deadline
          } catch (getError: any) {
            // Event doesn't exist (404) or error accessing it, create new one
            console.log(`Event ${eventId} not found, creating new event for ${deadline.filename}`);
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

        // Store the event ID in the database (if column exists)
        try {
          await supabase
            .from("documents")
            .update({ calendar_event_id: createdEvent.data.id })
            .eq("id", deadline.id);
        } catch (updateError: any) {
          // Column might not exist yet - this is okay, event was still created
          console.log("Could not store calendar_event_id (column may not exist yet):", updateError.message);
        }

        syncedEvents.push({
          title: eventTitle,
          date: dateString,
          eventId: createdEvent.data.id,
          action: eventId ? "recreated" : "created",
        });
      } catch (eventError: any) {
        console.error(`Error syncing event for ${deadline.filename}:`, eventError);
        // Continue with other events
      }
    }

    // Update synced_at timestamp
    await supabase
      .from("calendar_sync")
      .update({
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      syncedCount: syncedEvents.length,
      events: syncedEvents,
    });
  } catch (error: any) {
    console.error("Error syncing calendar:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while syncing" },
      { status: 500 }
    );
  }
}

