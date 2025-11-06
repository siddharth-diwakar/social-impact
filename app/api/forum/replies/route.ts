import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendForumNotification } from "@/lib/forum-notifications";

// POST /api/forum/replies - Create a reply
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content, parentReplyId } = body;

    // Validate required fields
    if (!postId || !content) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    // Verify post exists and get user_id
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("id, user_id")
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Verify parent reply exists if provided
    if (parentReplyId) {
      const { data: parentReply, error: parentError } = await supabase
        .from("forum_replies")
        .select("id")
        .eq("id", parentReplyId)
        .eq("post_id", postId)
        .single();

      if (parentError || !parentReply) {
        return NextResponse.json(
          { error: "Parent reply not found" },
          { status: 404 }
        );
      }
    }

    // Create reply
    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_reply_id: parentReplyId || null,
        status: "published",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating reply:", error);
      return NextResponse.json(
        { 
          error: "Failed to create reply",
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Get user info for the reply
    let userInfo = null;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: userData } = await serviceClient.auth.admin.getUserById(user.id);
        if (userData?.user) {
          userInfo = {
            id: userData.user.id,
            email: userData.user.email,
            raw_user_meta_data: userData.user.user_metadata || {},
          };
        }
      }
    } catch (userError) {
      console.error("Error fetching user info:", userError);
    }

    if (!userInfo) {
      userInfo = {
        id: user.id,
        email: user.email || null,
        raw_user_meta_data: user.user_metadata || {},
      };
    }

    const replyWithUser = {
      ...reply,
      user: userInfo,
    };

    // Check for mentions in content (@username pattern)
    const mentionPattern = /@(\w+)/g;
    const mentions = content.match(mentionPattern);
    
    // Send notifications for replies and mentions
    try {
      // Notify post author of new reply (if not the same user)
      if (post.user_id !== user.id) {
        await sendForumNotification({
          supabase,
          userId: post.user_id,
          type: "reply",
          postId: postId,
          replyId: reply.id,
          actorUserId: user.id,
        });
      }

      // TODO: Send notifications for mentions
      // This would require matching usernames to user IDs
      // For now, we'll log mentions for future implementation
      if (mentions) {
        console.log("Mentions detected:", mentions);
      }
    } catch (notifError) {
      // Don't fail the reply creation if notification fails
      console.error("Error sending notifications:", notifError);
    }

    return NextResponse.json({ reply: replyWithUser }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/forum/replies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

