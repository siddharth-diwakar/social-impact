import twilio from "twilio";

// Initialize Twilio client only if credentials are available
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

interface SMSOptions {
  to: string; // Phone number in E.164 format (e.g., +1234567890)
  message: string;
}

export async function sendSMS({ to, message }: SMSOptions) {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.error("Twilio credentials are not set");
      return { success: false, error: "SMS service not configured" };
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error("TWILIO_PHONE_NUMBER is not set");
      return { success: false, error: "Twilio phone number not configured" };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return { success: false, error: error.message };
  }
}

export function generateDeadlineReminderSMS(
  documentName: string,
  deadlineDate: Date,
  daysUntil: number
): string {
  const formattedDate = deadlineDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // SMS messages have a 160 character limit for optimal delivery
  // Keep it concise
  return `compl.io: ${documentName} deadline in ${daysUntil} day${daysUntil === 1 ? "" : "s"} (${formattedDate}). View: ${process.env.NEXT_PUBLIC_APP_URL}/Documents`;
}

export function generateWeeklyDigestSMS(
  upcomingDeadlinesCount: number,
  recentUpdatesCount: number
): string {
  return `compl.io Weekly Digest: ${upcomingDeadlinesCount} upcoming deadline${upcomingDeadlinesCount === 1 ? "" : "s"}, ${recentUpdatesCount} new compliance update${recentUpdatesCount === 1 ? "" : "s"}. View: ${process.env.NEXT_PUBLIC_APP_URL}`;
}

