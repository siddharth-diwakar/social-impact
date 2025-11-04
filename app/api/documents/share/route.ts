import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, userIds } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "User IDs must be an array" },
        { status: 400 }
      );
    }

    // Verify document ownership
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("user_id")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update shared_with array
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        shared_with: userIds,
      })
      .eq("id", documentId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update sharing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in share document:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to share document",
      },
      { status: 500 }
    );
  }
}

