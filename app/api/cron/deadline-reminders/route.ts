import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, generateDeadlineReminderEmail } from "@/lib/email-service";
import { sendSMS, generateDeadlineReminderSMS } from "@/lib/sms-service";

// This route should be protected with a secret token
// Add it to your environment variables as CRON_SECRET
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
    const reminders = [
      { days: 30, date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      { days: 14, date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
      { days: 7, date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      { days: 1, date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) },
    ];

    let totalSent = 0;
    const errors: string[] = [];

    // Process each reminder type
    for (const reminder of reminders) {
      const reminderDate = reminder.date;
      const reminderDays = reminder.days;

      // Find documents with expiration dates matching this reminder window
      // Check if expiration_date is within 24 hours of reminderDate
      const startDate = new Date(reminderDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(reminderDate);
      endDate.setHours(23, 59, 59, 999);

      const { data: documents, error: docsError } = await supabase
        .from("documents")
        .select("id, user_id, filename, expiration_date")
        .not("expiration_date", "is", null)
        .gte("expiration_date", startDate.toISOString())
        .lte("expiration_date", endDate.toISOString());

      if (docsError) {
        console.error("Error fetching documents:", docsError);
        errors.push(`Error fetching documents for ${reminderDays}-day reminder: ${docsError.message}`);
        continue;
      }

      if (!documents || documents.length === 0) {
        continue;
      }

      // Process each document
      for (const doc of documents) {
        try {
          // Get user notification preferences
          const { data: preferences, error: prefError } = await supabase
            .from("notification_preferences")
            .select("*")
            .eq("user_id", doc.user_id)
            .single();

          if (prefError && prefError.code !== "PGRST116") {
            console.error("Error fetching preferences:", prefError);
            continue;
          }

          // Check if this reminder should be sent
          const shouldSendReminder = preferences
            ? preferences[`reminder_${reminderDays}_days` as keyof typeof preferences] === true
            : true; // Default to true if no preferences

          if (!shouldSendReminder) {
            continue;
          }

          // Get user details
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            doc.user_id
          );

          if (userError || !userData?.user) {
            console.error("Error fetching user:", userError);
            continue;
          }

          const user = userData.user;
          const userMetadata = user.user_metadata || {};

          // Check if we've already sent this reminder
          const { data: existingNotification } = await supabase
            .from("notification_history")
            .select("id")
            .eq("user_id", doc.user_id)
            .eq("document_id", doc.id)
            .eq("reminder_days_before", reminderDays)
            .eq("notification_type", "deadline_reminder")
            .gte("sent_at", startDate.toISOString())
            .single();

          if (existingNotification) {
            continue; // Already sent
          }

          // Determine channels
          const channels = preferences?.reminder_channels || ["email"];
          const deadlineDate = new Date(doc.expiration_date);

          // Send notifications
          for (const channel of channels) {
            let notificationSent = false;
            let errorMessage: string | null = null;

            if (channel === "email" && (preferences?.email_enabled !== false)) {
              const emailAddress = preferences?.email_address || user.email;
              if (emailAddress) {
                const emailHtml = generateDeadlineReminderEmail(
                  doc.filename,
                  deadlineDate,
                  reminderDays
                );
                const emailResult = await sendEmail({
                  to: emailAddress,
                  subject: `Reminder: ${doc.filename} deadline in ${reminderDays} day${reminderDays === 1 ? "" : "s"}`,
                  html: emailHtml,
                });

                if (emailResult.success) {
                  notificationSent = true;
                  totalSent++;
                } else {
                  errorMessage = emailResult.error as string;
                }
              }
            }

            if (channel === "sms" && preferences?.sms_enabled) {
              const phoneNumber = preferences?.phone_number || userMetadata.phone;
              if (phoneNumber) {
                const smsMessage = generateDeadlineReminderSMS(
                  doc.filename,
                  deadlineDate,
                  reminderDays
                );
                const smsResult = await sendSMS({
                  to: phoneNumber,
                  message: smsMessage,
                });

                if (smsResult.success) {
                  notificationSent = true;
                  totalSent++;
                } else {
                  errorMessage = smsResult.error as string;
                }
              }
            }

            // Log notification in history
            await supabase.from("notification_history").insert({
              user_id: doc.user_id,
              notification_type: "deadline_reminder",
              channel,
              recipient: preferences?.email_address || preferences?.phone_number || user.email || "",
              subject: channel === "email" ? `Reminder: ${doc.filename} deadline in ${reminderDays} day${reminderDays === 1 ? "" : "s"}` : null,
              document_id: doc.id,
              deadline_date: deadlineDate.toISOString(),
              reminder_days_before: reminderDays,
              status: notificationSent ? "sent" : "failed",
              error_message: errorMessage,
            });
          }
        } catch (error: any) {
          console.error(`Error processing document ${doc.id}:`, error);
          errors.push(`Error processing document ${doc.id}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in deadline reminders cron:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

