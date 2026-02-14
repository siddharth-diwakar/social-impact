import { Resend } from "resend";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "compl.io <notifications@compl.io>",
}: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return { success: false, error: "Email service not configured" };
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

export function generateDeadlineReminderEmail(
  documentName: string,
  deadlineDate: Date,
  daysUntil: number
): string {
  const formattedDate = deadlineDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deadline Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">compl.io</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">⏰ Deadline Reminder</h2>
          <p style="font-size: 16px;">This is a reminder about an upcoming deadline:</p>
          
          <div style="background-color: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${documentName}
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280;">
              <strong>Deadline:</strong> ${formattedDate}
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280;">
              <strong>Time remaining:</strong> ${daysUntil} ${daysUntil === 1 ? "day" : "days"}
            </p>
          </div>

          <p style="color: #6b7280;">Please take action to ensure this deadline is met on time.</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/Documents" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Document
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">
            You're receiving this because you have deadline reminders enabled.
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/Profile" style="color: #10b981;">Manage notification preferences</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

export function generateWeeklyDigestEmail(
  userName: string,
  industry: string | null,
  upcomingDeadlines: Array<{
    documentName: string;
    deadlineDate: Date;
    daysUntil: number;
  }>,
  recentUpdates: Array<{
    title: string;
    summary: string;
  }>
): string {
  const deadlinesHtml = upcomingDeadlines.length > 0
    ? upcomingDeadlines
        .map(
          (deadline) => `
          <div style="background-color: white; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #111827;">${deadline.documentName}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
              Due in ${deadline.daysUntil} ${deadline.daysUntil === 1 ? "day" : "days"} • ${deadline.deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        `
        )
        .join("")
    : '<p style="color: #6b7280;">No upcoming deadlines in the next 30 days. Great job staying on top of things! 🎉</p>';

  const updatesHtml = recentUpdates.length > 0
    ? recentUpdates
        .map(
          (update) => `
          <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 4px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-weight: 600; color: #111827;">${update.title}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${update.summary}</p>
          </div>
        `
        )
        .join("")
    : '<p style="color: #6b7280;">No new compliance updates this week.</p>';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Compliance Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">compl.io Weekly Digest</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; margin-top: 0;">Hello ${userName || "there"},</h2>
          <p style="font-size: 16px; color: #374151;">Here's your weekly compliance digest${industry ? ` for ${industry} businesses` : ""}:</p>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #111827; font-size: 18px; margin-bottom: 15px;">📅 Upcoming Deadlines</h3>
            ${deadlinesHtml}
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #111827; font-size: 18px; margin-bottom: 15px;">📰 Compliance Updates</h3>
            ${updatesHtml}
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Dashboard
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">
            This digest is personalized based on your business profile and industry.
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/Profile" style="color: #10b981;">Manage notification preferences</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

