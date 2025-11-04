import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // "connect" or "disconnect"

    if (action === "disconnect") {
      // Delete calendar sync
      const { error } = await supabase
        .from("calendar_sync")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error disconnecting calendar:", error);
        return NextResponse.json(
          { error: "Failed to disconnect calendar" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, connected: false });
    }

    // Initiate OAuth flow
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/calendar/callback`
    );

    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state: user.id, // Pass user ID in state for security
    });

    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error("Error in calendar auth:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

