import { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "./email-service";

type ForumNotificationType = "reply" | "mention" | "like" | "follow";

type SendForumNotificationParams = {
  supabase: SupabaseClient;
  userId: string;
  type: ForumNotificationType;
  postId?: string;
  replyId?: string;
  actorUserId?: string;
  metadata?: Record<string, any>;
};

export async function sendForumNotification({
  supabase,
  userId,
  type,
  postId,
  replyId,
  actorUserId,
  metadata = {},
}: SendForumNotificationParams) {
  try {
    // Get user's notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Default to email enabled if no preferences found
    const emailEnabled = prefs?.email_enabled !== false;

    if (!emailEnabled) {
      return; // User has disabled email notifications
    }

    // Get user's email - prefer email_address from preferences, fallback to auth
    let userEmail = prefs?.email_address;
    
    // If no email in preferences, try to get from auth using service role
    if (!userEmail && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: userData } = await serviceClient.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email;
    }
    
    if (!userEmail) {
      console.log("No email found for user:", userId);
      return;
    }

    // Get actor user info
    let actorName = "A community member";
    if (actorUserId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: actorData } = await serviceClient.auth.admin.getUserById(actorUserId);
      actorName =
        actorData?.user?.user_metadata?.full_name ||
        actorData?.user?.user_metadata?.name ||
        actorData?.user?.email?.split("@")[0] ||
        "A community member";
    }

    // Get post/reply details
    let postTitle = "";
    let postLink = "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (postId) {
      const { data: post } = await supabase
        .from("forum_posts")
        .select("title")
        .eq("id", postId)
        .single();

      if (post) {
        postTitle = post.title;
        postLink = `${appUrl}/Community/${postId}`;
      }
    }

    // Build notification content based on type
    let subject = "";
    let body = "";

    switch (type) {
      case "reply":
        subject = `${actorName} replied to your post: ${postTitle}`;
        body = `
          <p>Hi there,</p>
          <p><strong>${actorName}</strong> replied to your post "<strong>${postTitle}</strong>".</p>
          <p><a href="${postLink}" style="display: inline-block; padding: 10px 20px; background-color: #1F7A5C; color: white; text-decoration: none; border-radius: 5px;">View Reply</a></p>
          <p>Best regards,<br>The compl.io Team</p>
        `;
        break;

      case "mention":
        subject = `${actorName} mentioned you in a post`;
        body = `
          <p>Hi there,</p>
          <p><strong>${actorName}</strong> mentioned you in a post "<strong>${postTitle}</strong>".</p>
          <p><a href="${postLink}" style="display: inline-block; padding: 10px 20px; background-color: #1F7A5C; color: white; text-decoration: none; border-radius: 5px;">View Post</a></p>
          <p>Best regards,<br>The compl.io Team</p>
        `;
        break;

      case "like":
        subject = `${actorName} liked your post`;
        body = `
          <p>Hi there,</p>
          <p><strong>${actorName}</strong> liked your post "<strong>${postTitle}</strong>".</p>
          <p><a href="${postLink}" style="display: inline-block; padding: 10px 20px; background-color: #1F7A5C; color: white; text-decoration: none; border-radius: 5px;">View Post</a></p>
          <p>Best regards,<br>The compl.io Team</p>
        `;
        break;

      case "follow":
        subject = `${actorName} started following you`;
        body = `
          <p>Hi there,</p>
          <p><strong>${actorName}</strong> started following you on compl.io.</p>
          <p><a href="${appUrl}/Community" style="display: inline-block; padding: 10px 20px; background-color: #1F7A5C; color: white; text-decoration: none; border-radius: 5px;">Visit Community</a></p>
          <p>Best regards,<br>The compl.io Team</p>
        `;
        break;
    }

    // Send email
    if (subject && body) {
      await sendEmail({
        to: userEmail,
        subject,
        html: body,
      });

      // Log notification in history
      await supabase.from("notification_history").insert({
        user_id: userId,
        notification_type: `forum_${type}`,
        channel: "email",
        recipient: userEmail,
        subject,
        metadata: {
          postId,
          replyId,
          actorUserId,
          ...metadata,
        },
        status: "sent",
      });
    }
  } catch (error) {
    console.error("Error sending forum notification:", error);
    // Log failed notification
    try {
      await supabase.from("notification_history").insert({
        user_id: userId,
        notification_type: `forum_${type}`,
        channel: "email",
        recipient: "",
        subject: "",
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          postId,
          replyId,
          actorUserId,
          ...metadata,
        },
      });
    } catch (logError) {
      console.error("Error logging failed notification:", logError);
    }
  }
}

