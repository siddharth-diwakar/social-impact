import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get document count
    const { count: documentCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get user metadata
    const userData = user.user_metadata || {};

    return NextResponse.json({
      documentCount: documentCount || 0,
      accountCreatedAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

