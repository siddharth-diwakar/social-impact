import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Pricing } from "@/components/ui/pricing";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { mockPricingPlans } from "@/lib/data/pricing";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E1421] via-[#531324] to-[#7D3227] text-[#EDD9D4]">
      <header className="sticky top-0 z-50 border-b border-[#EDD9D4]/25 bg-[#3E1421]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-[#EDD9D4] transition-colors hover:text-white"
            >
              compl.io
            </Link>
            <span className="text-sm text-[#EDD9D4]/70">Payments</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border border-[#EDD9D4]/40 text-[#EDD9D4] hover:border-[#EDD9D4] hover:bg-[#EDD9D4]/10 hover:text-white"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <ThemeSwitcher />
            <Suspense fallback={<Button size="sm">Loading</Button>}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#EDD9D4]/25 bg-[#3E1421]/60 shadow-[0_40px_180px_-80px_rgba(237,217,212,0.4)]">
          <Pricing
            plans={mockPricingPlans}
            title="Compare plans and billing"
            description={`Switch between monthly and annual billing to see what fits best.\nYou can upgrade directly inside the app when ready.`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#EDD9D4]/30 bg-[#531324]/60 p-6">
          <div>
            <p className="text-lg font-semibold text-[#EDD9D4]">Need help?</p>
            <p className="text-sm text-[#EDD9D4]/70">
              Our team can walk you through payment options and invoices.
            </p>
          </div>
          <Button
            asChild
            className="gap-2 rounded-full border border-[#EDD9D4]/20 bg-[#EDD9D4] text-[#3E1421] hover:bg-[#EDD9D4]/90"
          >
            <Link href="/Community">
              Talk to us
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

