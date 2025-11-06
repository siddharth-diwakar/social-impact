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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Ensure user can only view their own activity
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch user's posts
    const { data: posts, error: postsError } = await supabase
      .from("forum_posts")
      .select("id, title, content, created_at, like_count, reply_count")
      .eq("user_id", user.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
    }

    // Fetch user's replies
    const { data: replies, error: repliesError } = await supabase
      .from("forum_replies")
      .select("id, content, created_at, post_id")
      .eq("user_id", user.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
    }

    // Get post titles for replies
    const replyPostIds = (replies || [])
      .map((r) => r.post_id)
      .filter((id): id is string => !!id);

    let postTitlesMap: Record<string, string> = {};
    if (replyPostIds.length > 0) {
      const { data: replyPosts } = await supabase
        .from("forum_posts")
        .select("id, title")
        .in("id", replyPostIds);

      if (replyPosts) {
        postTitlesMap = replyPosts.reduce(
          (acc, post) => {
            acc[post.id] = post.title;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    }

    // Combine and format activities
    const activities: any[] = [];

    // Add posts
    (posts || []).forEach((post) => {
      activities.push({
        id: post.id,
        type: "post",
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        like_count: post.like_count || 0,
        reply_count: post.reply_count || 0,
      });
    });

    // Add replies
    (replies || []).forEach((reply) => {
      activities.push({
        id: reply.id,
        type: "reply",
        content: reply.content,
        created_at: reply.created_at,
        post_id: reply.post_id,
        post_title: reply.post_id ? postTitlesMap[reply.post_id] : null,
      });
    });

    // Sort by created_at descending
    activities.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({ activities: limitedActivities });
  } catch (error: any) {
    console.error("Error in GET /api/profile/activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

