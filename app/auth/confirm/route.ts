import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const code = searchParams.get("code"); // OAuth callback code

  const supabase = await createClient();

  // Handle OAuth callback
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    } else {
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  // Handle email OTP verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      return NextResponse.redirect(new URL(next, request.url));
    } else {
      // redirect the user to an error page with some instructions
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  // redirect the user to an error page with some instructions
  return NextResponse.redirect(
    new URL(`/auth/error?error=${encodeURIComponent("No token hash or type")}`, request.url)
  );
}
