import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";
  const code = searchParams.get("code"); // OAuth callback code

  const supabase = await createClient();

  // Helper function to check onboarding status and redirect
  const checkOnboardingAndRedirect = async (redirectUrl: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Check if user has completed onboarding
    const { data: onboardingData } = await supabase
      .from("onboarding")
      .select("completed")
      .eq("user_id", user.id)
      .single();

    // If onboarding not completed, redirect to onboarding
    if (!onboardingData?.completed) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Otherwise, redirect to the intended destination
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  };

  // Handle OAuth callback
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return await checkOnboardingAndRedirect(next);
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
      // Check onboarding and redirect
      return await checkOnboardingAndRedirect(next);
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
