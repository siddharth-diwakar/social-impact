import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/forum/likes - Toggle like on a post or reply
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
    const { postId, replyId } = body;

    // Validate that either postId or replyId is provided
    if (!postId && !replyId) {
      return NextResponse.json(
        { error: "Either postId or replyId is required" },
        { status: 400 }
      );
    }

    if (postId && replyId) {
      return NextResponse.json(
        { error: "Cannot like both post and reply" },
        { status: 400 }
      );
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq(postId ? "post_id" : "reply_id", postId || replyId)
      .single();

    if (existingLike) {
      // Unlike - delete the like
      const { error } = await supabase
        .from("forum_likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        console.error("Error removing like:", error);
        return NextResponse.json(
          { error: "Failed to remove like" },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like - create the like
      const { data: like, error } = await supabase
        .from("forum_likes")
        .insert({
          user_id: user.id,
          post_id: postId || null,
          reply_id: replyId || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating like:", error);
        return NextResponse.json(
          { error: "Failed to create like" },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: true, like });
    }
  } catch (error) {
    console.error("Error in POST /api/forum/likes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

