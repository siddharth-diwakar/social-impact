import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowUpRight, Globe2, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CalendarSync } from "@/components/calendar-sync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const navLinks = [
  { href: "/Community", label: "Community" },
  { href: "/Documents", label: "Documents" },
];

const complianceAlerts = [
  {
    title: "State sustainability reporting update",
    summary:
      "Texas SB-249 requires quarterly energy disclosures from floral retailers beginning June 15.",
    status: "Action needed",
    icon: ShieldCheck,
  },
  {
    title: "Federal packaging compliance",
    summary:
      "USDA has released revised compostable packaging guidelines impacting subscription deliveries.",
    status: "New",
    icon: Globe2,
  },
];

const upcomingDeadlines = [
  {
    title: "Cottage Food License Renewal",
    due: "May 12, 2025",
    note: "Form 889 must be filed 30 days before expiration.",
  },
  {
    title: "City signage permit review",
    due: "June 3, 2025",
    note: "Updated storefront signage plan required for approval.",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen text-[#EDD9D4]">
      <header className="sticky top-0 z-50 border-b border-[#EDD9D4]/25 bg-[#3E1421]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-2">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-[#EDD9D4] transition-colors hover:text-white"
            >
              compl.io
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#EDD9D4]/70 transition-colors hover:bg-[#EDD9D4]/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <ThemeSwitcher />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border border-[#EDD9D4]/50 px-4 py-2 text-sm font-medium text-[#EDD9D4] hover:border-[#EDD9D4] hover:bg-[#EDD9D4]/10 hover:text-white"
            >
              <Link href="/Profile">Profile</Link>
            </Button>
            <Suspense fallback={<Button size="sm">Loading</Button>}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="glass-panel rounded-3xl border border-[#EDD9D4]/25 p-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold">Stay ahead of policy shifts in your community.</h1>
            <p className="max-w-3xl text-base text-[#EDD9D4]/80">
              We surface local, state, and federal rule changes that impact small businesses like yours—so you can plan with confidence instead of scrambling at the last minute.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start">
          <div className="space-y-6">
            <Card className="glass-panel border border-[#EDD9D4]/20">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-[#EDD9D4]">
                    Latest compliance alerts
                  </CardTitle>
                  <CardDescription className="text-sm text-[#EDD9D4]/70">
                    Summaries tailored to Austin, TX floral retailers.
                  </CardDescription>
                </div>
                <Button variant="ghost" className="gap-2 text-sm text-[#EDD9D4] hover:bg-[#EDD9D4]/10">
                  View all updates
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {complianceAlerts.map((alert) => (
                  <article
                    key={alert.title}
                    className="rounded-2xl border border-[#EDD9D4]/20 bg-[#3E1421]/60 p-4 shadow-lg shadow-black/30 transition-colors hover:border-[#EDD9D4]/40"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EDD9D4]/15 text-[#EDD9D4]">
                        <alert.icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[#EDD9D4]">{alert.title}</h3>
                          <Badge className="border border-[#EDD9D4]/30 bg-[#AF755C]/50 text-[#EDD9D4]">
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-[#EDD9D4]/80">{alert.summary}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-panel border border-[#EDD9D4]/20">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-[#EDD9D4]">
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-base text-[#EDD9D4]/70">
                  Describe a regulation or policy challenge and get an instant summary, next steps, and recommended contacts tailored to your business.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#EDD9D4]/80 sm:max-w-md">
                  Not sure what a new rule means for you? Let our assistant break it down and outline a plan.
                </p>
                <Button
                  asChild
                  className="gap-2 rounded-full border border-[#EDD9D4]/20 bg-[#EDD9D4] text-[#3E1421] hover:bg-[#EDD9D4]/90"
                >
                  <Link href="/Assistant">
                    Open AI assistant
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-panel border border-[#EDD9D4]/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#EDD9D4]">
                  Upcoming deadlines
                </CardTitle>
                <CardDescription className="text-sm text-[#EDD9D4]/70">
                  Prioritized by proximity and impact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[#EDD9D4]/20 bg-[#3E1421]/60 p-4 text-sm text-[#EDD9D4]"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-[#EDD9D4]/70">
                      Due {item.due}
                    </p>
                    <p className="mt-2 text-sm text-[#EDD9D4]/80">{item.note}</p>
                  </div>
                ))}
                <Suspense fallback={<div className="h-10 w-full" />}>
                  <CalendarSync />
                </Suspense>
              </CardContent>
            </Card>
            <Suspense fallback={<div className="h-64 w-full" />}>
              </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
