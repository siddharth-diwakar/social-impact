import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has calendar sync
    const { data: calendarSync, error } = await supabase
      .from("calendar_sync")
      .select("calendar_name, synced_at, updated_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine
      console.error("Error checking calendar status:", error);
      return NextResponse.json(
        { error: "Failed to check calendar status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      connected: !!calendarSync,
      calendarName: calendarSync?.calendar_name || null,
      syncedAt: calendarSync?.synced_at || null,
      updatedAt: calendarSync?.updated_at || null,
    });
  } catch (error: any) {
    console.error("Error in calendar status:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

