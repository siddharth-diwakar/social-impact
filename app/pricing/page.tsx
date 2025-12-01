import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Pricing } from "@/components/ui/pricing";
import { mockPricingPlans } from "@/lib/data/pricing";
import { createClient } from "@/lib/supabase/server";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pricingPlans = mockPricingPlans.map((plan) => ({
    ...plan,
    href: user
      ? plan.href
      : `/auth/login?redirect=${encodeURIComponent(plan.href)}`,
    buttonText: "Get Started",
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E1421] via-[#531324] to-[#7D3227] text-[#EDD9D4]">
      <header className="sticky top-0 z-40 border-b border-[#531324] bg-[#3E1421]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg font-semibold text-[#EDD9D4] transition-colors hover:text-white"
            >
              compl.io
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] text-[#EDD9D4]/70">
              Pricing
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border border-[#EDD9D4]/50 px-4 py-2 text-sm font-medium text-[#EDD9D4] hover:border-[#EDD9D4] hover:bg-[#EDD9D4]/10 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
            </Button>
            <Suspense fallback={<Button size="sm">Loading</Button>}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#EDD9D4]/25 bg-[#3E1421]/60 shadow-[0_40px_180px_-80px_rgba(237,217,212,0.4)]">
          <Pricing plans={pricingPlans} hideHeader compact />
        </section>
      </main>
    </div>
  );
}
