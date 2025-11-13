import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const headerButtonClass =
    "rounded-full border border-[#EDD9D4]/50 px-4 py-2 text-sm font-medium text-[#EDD9D4] hover:border-[#EDD9D4] hover:bg-[#EDD9D4]/10 hover:text-white";

  return user ? (
    <LogoutButton className={headerButtonClass} />
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        className="border border-[#EDD9D4]/50 bg-transparent text-[#EDD9D4] hover:bg-[#EDD9D4]/10"
        variant="outline"
      >
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="bg-[#EDD9D4] text-[#3E1421] hover:bg-[#EDD9D4]/90"
        variant="default"
      >
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
