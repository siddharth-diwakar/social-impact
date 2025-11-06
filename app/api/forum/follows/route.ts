import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/forum/follows - Get user's follows or followers
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
    const type = searchParams.get("type") || "following"; // 'following' or 'followers'
    const userId = searchParams.get("userId") || user.id;

    if (type === "following") {
      // Get users that this user is following
      const { data: follows, error } = await supabase
        .from("forum_follows")
        .select(`
          *,
          following:following_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq("follower_id", userId);

      if (error) {
        console.error("Error fetching following:", error);
        return NextResponse.json(
          { error: "Failed to fetch following" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        users: (follows || []).map((f) => f.following),
      });
    } else {
      // Get users that follow this user
      const { data: follows, error } = await supabase
        .from("forum_follows")
        .select(`
          *,
          follower:follower_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq("following_id", userId);

      if (error) {
        console.error("Error fetching followers:", error);
        return NextResponse.json(
          { error: "Failed to fetch followers" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        users: (follows || []).map((f) => f.follower),
      });
    }
  } catch (error) {
    console.error("Error in GET /api/forum/follows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/forum/follows - Toggle follow on a user
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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: "Following ID is required" },
        { status: 400 }
      );
    }

    if (followingId === user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if follow already exists
    const { data: existingFollow } = await supabase
      .from("forum_follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .single();

    if (existingFollow) {
      // Unfollow - delete the follow
      const { error } = await supabase
        .from("forum_follows")
        .delete()
        .eq("id", existingFollow.id);

      if (error) {
        console.error("Error removing follow:", error);
        return NextResponse.json(
          { error: "Failed to remove follow" },
          { status: 500 }
        );
      }

      return NextResponse.json({ following: false });
    } else {
      // Follow - create the follow
      const { data: follow, error } = await supabase
        .from("forum_follows")
        .insert({
          follower_id: user.id,
          following_id: followingId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating follow:", error);
        return NextResponse.json(
          { error: "Failed to create follow" },
          { status: 500 }
        );
      }

      return NextResponse.json({ following: true, follow });
    }
  } catch (error) {
    console.error("Error in POST /api/forum/follows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

