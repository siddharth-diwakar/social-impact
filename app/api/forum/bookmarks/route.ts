import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/forum/bookmarks - Get user's bookmarked posts
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get bookmarked posts
    const { data: bookmarks, error } = await supabase
      .from("forum_bookmarks")
      .select(`
        *,
        post:post_id (
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookmarks" },
        { status: 500 }
      );
    }

    const posts = (bookmarks || [])
      .map((b) => b.post)
      .filter((p) => p && p.status === "published");

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error in GET /api/forum/bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/forum/bookmarks - Toggle bookmark on a post
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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const { data: existingBookmark } = await supabase
      .from("forum_bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .single();

    if (existingBookmark) {
      // Unbookmark - delete the bookmark
      const { error } = await supabase
        .from("forum_bookmarks")
        .delete()
        .eq("id", existingBookmark.id);

      if (error) {
        console.error("Error removing bookmark:", error);
        return NextResponse.json(
          { error: "Failed to remove bookmark" },
          { status: 500 }
        );
      }

      return NextResponse.json({ bookmarked: false });
    } else {
      // Bookmark - create the bookmark
      const { data: bookmark, error } = await supabase
        .from("forum_bookmarks")
        .insert({
          user_id: user.id,
          post_id: postId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating bookmark:", error);
        return NextResponse.json(
          { error: "Failed to create bookmark" },
          { status: 500 }
        );
      }

      return NextResponse.json({ bookmarked: true, bookmark });
    }
  } catch (error) {
    console.error("Error in POST /api/forum/bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

