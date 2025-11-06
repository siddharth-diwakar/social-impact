import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/forum/replies/[id] - Update a reply
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
    const { content } = body;

    // Verify ownership
    const { data: reply, error: replyError } = await supabase
      .from("forum_replies")
      .select("user_id")
      .eq("id", id)
      .single();

    if (replyError || !reply || reply.user_id !== user.id) {
      return NextResponse.json(
        { error: "Reply not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update reply
    const { data: updatedReply, error } = await supabase
      .from("forum_replies")
      .update({ content: content.trim() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating reply:", error);
      return NextResponse.json(
        { error: "Failed to update reply" },
        { status: 500 }
      );
    }

    // Get user info separately (since foreign key relationship isn't working)
    let userInfo = null;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: userData } = await serviceClient.auth.admin.getUserById(updatedReply.user_id);
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
        id: updatedReply.user_id,
        email: null,
        raw_user_meta_data: {},
      };
    }

    return NextResponse.json({
      reply: {
        ...updatedReply,
        user: userInfo,
      },
    });
  } catch (error) {
    console.error("Error in PUT /api/forum/replies/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/replies/[id] - Delete a reply
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
    const { data: reply, error: replyError } = await supabase
      .from("forum_replies")
      .select("user_id")
      .eq("id", id)
      .single();

    if (replyError || !reply || reply.user_id !== user.id) {
      return NextResponse.json(
        { error: "Reply not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to 'deleted'
    const { error } = await supabase
      .from("forum_replies")
      .update({ status: "deleted" })
      .eq("id", id);

    if (error) {
      console.error("Error deleting reply:", error);
      return NextResponse.json(
        { error: "Failed to delete reply" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/forum/replies/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

