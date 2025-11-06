import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/forum/posts/[id] - Get a single post with replies
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get the post
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      console.error("Error fetching post:", postError);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Get user info separately (since foreign key relationship isn't working)
    let userInfo = null;
    try {
      // Get user from auth.users via service role if available
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: userData } = await serviceClient.auth.admin.getUserById(post.user_id);
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
      // Continue without user info
    }

    // If we couldn't get user info, create a basic structure
    if (!userInfo) {
      userInfo = {
        id: post.user_id,
        email: null,
        raw_user_meta_data: {},
      };
    }

    // Increment view count
    await supabase
      .from("forum_posts")
      .update({ view_count: post.view_count + 1 })
      .eq("id", id);

    // Get replies
    const { data: replies, error: repliesError } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("post_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
    }

    // Get user info for replies
    const repliesWithUserInfo = await Promise.all(
      (replies || []).map(async (reply) => {
        let replyUserInfo = null;
        try {
          if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { createClient: createServiceClient } = await import("@supabase/supabase-js");
            const serviceClient = createServiceClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { data: userData } = await serviceClient.auth.admin.getUserById(reply.user_id);
            if (userData?.user) {
              replyUserInfo = {
                id: userData.user.id,
                email: userData.user.email,
                raw_user_meta_data: userData.user.user_metadata || {},
              };
            }
          }
        } catch (err) {
          console.error("Error fetching reply user info:", err);
        }

        return {
          ...reply,
          user: replyUserInfo || {
            id: reply.user_id,
            email: null,
            raw_user_meta_data: {},
          },
        };
      })
    );

    // Get current user to check likes and bookmarks
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isLiked = false;
    let isBookmarked = false;
    const likedReplyIds = new Set<string>();

    if (user) {
      // Check if user liked the post
      const { data: like } = await supabase
        .from("forum_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .single();

      isLiked = !!like;

      // Check if user bookmarked the post
      const { data: bookmark } = await supabase
        .from("forum_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .single();

      isBookmarked = !!bookmark;

      // Get user's liked replies
      if (repliesWithUserInfo && repliesWithUserInfo.length > 0) {
        const replyIds = repliesWithUserInfo.map((r) => r.id);
        const { data: replyLikes } = await supabase
          .from("forum_likes")
          .select("reply_id")
          .eq("user_id", user.id)
          .in("reply_id", replyIds);

        if (replyLikes) {
          replyLikes.forEach((l) => {
            if (l.reply_id) likedReplyIds.add(l.reply_id);
          });
        }
      }
    }

    // Add interaction flags to replies
    const repliesWithInteractions = repliesWithUserInfo.map((reply) => ({
      ...reply,
      isLiked: likedReplyIds.has(reply.id),
    }));

    return NextResponse.json({
      post: {
        ...post,
        user: userInfo,
        isLiked,
        isBookmarked,
      },
      replies: repliesWithInteractions,
    });
  } catch (error) {
    console.error("Error in GET /api/forum/posts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/forum/posts/[id] - Update a post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, board, images } = body;

    // Verify ownership
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (postError || !post || post.user_id !== user.id) {
      return NextResponse.json(
        { error: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update post
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (board !== undefined) updateData.board = board;
    if (images !== undefined) updateData.images = images;

    const { data: updatedPost, error } = await supabase
      .from("forum_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("Error in PUT /api/forum/posts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/posts/[id] - Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (postError || !post || post.user_id !== user.id) {
      return NextResponse.json(
        { error: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete post (cascade will handle replies and likes)
    const { error } = await supabase.from("forum_posts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/forum/posts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

