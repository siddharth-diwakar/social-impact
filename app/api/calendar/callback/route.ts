import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // user_id
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/?calendar_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/?calendar_error=missing_code_or_state", request.url)
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== state) {
      return NextResponse.redirect(
        new URL("/?calendar_error=unauthorized", request.url)
      );
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/calendar/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/?calendar_error=no_access_token", request.url)
      );
    }

    // Get calendar info
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    let calendarId = "primary";
    let calendarName = "Primary Calendar";

    try {
      const calendarList = await calendar.calendarList.list();
      const primaryCalendar = calendarList.data.items?.find(
        (cal) => cal.primary
      );
      if (primaryCalendar) {
        calendarId = primaryCalendar.id || "primary";
        calendarName = primaryCalendar.summary || "Primary Calendar";
      }
    } catch (err) {
      console.error("Error fetching calendar list:", err);
      // Continue with default values
    }

    // Calculate token expiry
    const tokenExpiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null;

    // Store tokens in database
    const { error: upsertError } = await supabase
      .from("calendar_sync")
      .upsert(
        {
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expiry: tokenExpiry,
          calendar_id: calendarId,
          calendar_name: calendarName,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      console.error("Error storing calendar tokens:", upsertError);
      return NextResponse.redirect(
        new URL("/?calendar_error=storage_failed", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/?calendar_success=true", request.url)
    );
  } catch (error: any) {
    console.error("Error in calendar callback:", error);
    return NextResponse.redirect(
      new URL(
        `/?calendar_error=${encodeURIComponent(error.message || "unknown_error")}`,
        request.url
      )
    );
  }
}

