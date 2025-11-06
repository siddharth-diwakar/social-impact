import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, generateWeeklyDigestEmail } from "@/lib/email-service";
import { sendSMS, generateWeeklyDigestSMS } from "@/lib/sms-service";

// This route should be protected with a secret token
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get all users with weekly digest enabled
    const { data: preferences, error: prefError } = await supabase
      .from("notification_preferences")
      .select("*, user_id")
      .eq("weekly_digest_enabled", true)
      .eq("weekly_digest_day", dayOfWeek);

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
      return NextResponse.json(
        { error: prefError.message },
        { status: 500 }
      );
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to send digest to today",
        totalSent: 0,
      });
    }

    let totalSent = 0;
    const errors: string[] = [];

    // Process each user
    for (const pref of preferences) {
      try {
        // Get user details
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          pref.user_id
        );

        if (userError || !userData?.user) {
          console.error("Error fetching user:", userError);
          errors.push(`Error fetching user ${pref.user_id}: ${userError?.message}`);
          continue;
        }

        const user = userData.user;
        const userMetadata = user.user_metadata || {};

        // Check if we've already sent this week's digest
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const { data: existingDigest } = await supabase
          .from("notification_history")
          .select("id")
          .eq("user_id", pref.user_id)
          .eq("notification_type", "weekly_digest")
          .gte("sent_at", weekStart.toISOString())
          .single();

        if (existingDigest) {
          continue; // Already sent this week
        }

        // Get user's upcoming deadlines (next 30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const { data: documents } = await supabase
          .from("documents")
          .select("id, filename, expiration_date")
          .eq("user_id", pref.user_id)
          .not("expiration_date", "is", null)
          .gte("expiration_date", now.toISOString())
          .lte("expiration_date", thirtyDaysFromNow.toISOString())
          .order("expiration_date", { ascending: true })
          .limit(10);

        const upcomingDeadlines = (documents || []).map((doc) => {
          const deadlineDate = new Date(doc.expiration_date);
          const daysUntil = Math.ceil(
            (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            documentName: doc.filename,
            deadlineDate,
            daysUntil,
          };
        });

        // Get recent compliance updates (mock data for now - you can integrate with actual compliance feed)
        // TODO: Replace with actual compliance update data from your sources
        const recentUpdates: Array<{ title: string; summary: string }> = [
          {
            title: "State sustainability reporting update",
            summary: "Texas SB-249 requires quarterly energy disclosures from floral retailers beginning June 15.",
          },
          {
            title: "Federal packaging compliance",
            summary: "USDA has released revised compostable packaging guidelines impacting subscription deliveries.",
          },
        ];

        // Filter updates by user's industry (if available)
        const userIndustry = userMetadata.industry;
        // For now, send all updates - you can filter based on industry later

        // Generate and send email
        const emailAddress = pref.email_address || user.email;
        if (emailAddress && pref.email_enabled) {
          const emailHtml = generateWeeklyDigestEmail(
            userMetadata.full_name || user.email?.split("@")[0] || "there",
            userIndustry,
            upcomingDeadlines,
            recentUpdates
          );

          const emailResult = await sendEmail({
            to: emailAddress,
            subject: `compl.io Weekly Digest - ${upcomingDeadlines.length} Upcoming Deadlines`,
            html: emailHtml,
          });

          if (emailResult.success) {
            totalSent++;
            // Log notification
            await supabase.from("notification_history").insert({
              user_id: pref.user_id,
              notification_type: "weekly_digest",
              channel: "email",
              recipient: emailAddress,
              subject: `compl.io Weekly Digest - ${upcomingDeadlines.length} Upcoming Deadlines`,
              metadata: {
                upcomingDeadlinesCount: upcomingDeadlines.length,
                recentUpdatesCount: recentUpdates.length,
              },
              status: "sent",
            });
          } else {
            errors.push(`Failed to send email to ${emailAddress}: ${emailResult.error}`);
            // Log failed notification
            await supabase.from("notification_history").insert({
              user_id: pref.user_id,
              notification_type: "weekly_digest",
              channel: "email",
              recipient: emailAddress,
              subject: `compl.io Weekly Digest - ${upcomingDeadlines.length} Upcoming Deadlines`,
              status: "failed",
              error_message: emailResult.error as string,
            });
          }
        }

        // Optionally send SMS digest (if enabled)
        if (pref.sms_enabled && pref.phone_number) {
          const smsMessage = generateWeeklyDigestSMS(
            upcomingDeadlines.length,
            recentUpdates.length
          );
          const smsResult = await sendSMS({
            to: pref.phone_number,
            message: smsMessage,
          });

          if (smsResult.success) {
            totalSent++;
            // Log SMS notification
            await supabase.from("notification_history").insert({
              user_id: pref.user_id,
              notification_type: "weekly_digest",
              channel: "sms",
              recipient: pref.phone_number,
              status: "sent",
            });
          }
        }
      } catch (error: any) {
        console.error(`Error processing user ${pref.user_id}:`, error);
        errors.push(`Error processing user ${pref.user_id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in weekly digest cron:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

