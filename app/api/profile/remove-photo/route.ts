import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove avatar_url from user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: null,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to remove profile photo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing photo:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

