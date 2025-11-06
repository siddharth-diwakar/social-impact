import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/forum/posts - Get all posts with filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const board = searchParams.get("board");
    const industry = searchParams.get("industry");
    const businessModel = searchParams.get("businessModel");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "last_activity_at"; // 'created_at', 'last_activity_at', 'like_count', 'reply_count'
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query - fetch posts without foreign key relationship
    let query = supabase
      .from("forum_posts")
      .select("*")
      .eq("status", "published");

    // Apply filters
    if (board) {
      query = query.eq("board", board);
    }
    if (industry) {
      query = query.eq("industry", industry);
    }
    if (businessModel) {
      query = query.eq("business_model", businessModel);
    }

    // Apply search (full-text search)
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortBy === "created_at" ? false : false; // Most recent first
    query = query.order(sortBy, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    // Get current user to check likes and bookmarks
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user info for posts separately
    const postsWithUserInfo = await Promise.all(
      (posts || []).map(async (post) => {
        let userInfo = null;
        try {
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
        } catch (err) {
          console.error("Error fetching user info:", err);
        }

        return {
          ...post,
          user: userInfo || {
            id: post.user_id,
            email: null,
            raw_user_meta_data: {},
          },
        };
      })
    );

    if (user && postsWithUserInfo) {
      // Get user's likes and bookmarks for these posts
      const postIds = postsWithUserInfo.map((p) => p.id);
      const [likesResult, bookmarksResult] = await Promise.all([
        supabase
          .from("forum_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds),
        supabase
          .from("forum_bookmarks")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds),
      ]);

      const likedPostIds = new Set(
        (likesResult.data || []).map((l) => l.post_id)
      );
      const bookmarkedPostIds = new Set(
        (bookmarksResult.data || []).map((b) => b.post_id)
      );

      // Add user interaction flags
      const postsWithInteractions = postsWithUserInfo.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        isBookmarked: bookmarkedPostIds.has(post.id),
      }));

      return NextResponse.json({ posts: postsWithInteractions });
    }

    return NextResponse.json({ posts: postsWithUserInfo || [] });
  } catch (error) {
    console.error("Error in GET /api/forum/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts - Create a new post
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
    const {
      title,
      content,
      industry,
      businessModel,
      customerDemographic,
      weeklyCustomers,
      board,
      images,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create post
    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        industry: industry || null,
        business_model: businessModel || null,
        customer_demographic: customerDemographic || null,
        weekly_customers: weeklyCustomers || null,
        board: board || null,
        images: images || [],
        status: "published",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error hint:", error.hint);
      console.error("Error details:", error.details);
      
      // If table doesn't exist, provide helpful message
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: "Database table not found. Please run the migration: supabase/migrations/009_add_forum_system.sql",
            details: error.message,
            code: error.code,
            hint: "Go to Supabase Dashboard → SQL Editor → Run the migration file"
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create post",
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    // Increment view count (author viewing their own post)
    await supabase
      .from("forum_posts")
      .update({ view_count: 1 })
      .eq("id", post.id);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/forum/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

