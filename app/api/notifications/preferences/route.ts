import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Get notification preferences
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notification preferences from database
    const { data: preferences, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine for first time
      console.error("Error fetching notification preferences:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // If no preferences exist, return defaults
    if (!preferences) {
      // Get user email and phone from auth metadata
      const userMetadata = user.user_metadata || {};
      const defaultPreferences = {
        email_enabled: true,
        email_address: user.email || null,
        sms_enabled: false,
        phone_number: userMetadata.phone || null,
        reminder_30_days: true,
        reminder_14_days: true,
        reminder_7_days: true,
        reminder_1_day: true,
        weekly_digest_enabled: true,
        weekly_digest_day: 1, // Monday
        weekly_digest_time: "09:00:00",
        reminder_channels: ["email"],
      };
      return NextResponse.json({ preferences: defaultPreferences });
    }

    // If email_address is null, use user's email
    if (!preferences.email_address && user.email) {
      preferences.email_address = user.email;
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// Update notification preferences
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      email_enabled,
      email_address,
      sms_enabled,
      phone_number,
      reminder_30_days,
      reminder_14_days,
      reminder_7_days,
      reminder_1_day,
      weekly_digest_enabled,
      weekly_digest_day,
      weekly_digest_time,
      reminder_channels,
    } = body;

    // Build update object
    const updates: Record<string, any> = {
      user_id: user.id,
    };

    if (email_enabled !== undefined) updates.email_enabled = email_enabled;
    if (email_address !== undefined) updates.email_address = email_address;
    if (sms_enabled !== undefined) updates.sms_enabled = sms_enabled;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (reminder_30_days !== undefined) updates.reminder_30_days = reminder_30_days;
    if (reminder_14_days !== undefined) updates.reminder_14_days = reminder_14_days;
    if (reminder_7_days !== undefined) updates.reminder_7_days = reminder_7_days;
    if (reminder_1_day !== undefined) updates.reminder_1_day = reminder_1_day;
    if (weekly_digest_enabled !== undefined) updates.weekly_digest_enabled = weekly_digest_enabled;
    if (weekly_digest_day !== undefined) updates.weekly_digest_day = weekly_digest_day;
    if (weekly_digest_time !== undefined) updates.weekly_digest_time = weekly_digest_time;
    if (reminder_channels !== undefined) updates.reminder_channels = reminder_channels;

    // Use upsert to create or update
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(updates, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating notification preferences:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, preferences: data });
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

