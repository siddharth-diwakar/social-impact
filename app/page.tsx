import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  FileText,
  Globe2,
  ShieldCheck,
} from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
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

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-2">
            <Link
              href="/"
              className="text-lg font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              name
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:text-slate-300 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200"
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
              className="border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-100"
            >
              <Link href="/Profile">Profile</Link>
            </Button>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Stay ahead of policy shifts in your community.
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
              We surface local, state, and federal rule changes that impact small
              businesses like yours—so you can plan with confidence instead of
              scrambling at the last minute.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 dark:border-emerald-900 dark:bg-slate-900">
                <BellRing className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                Real-time alerts
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 dark:border-emerald-900 dark:bg-slate-900">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                Actionable guidance
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-emerald-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Latest compliance alerts
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Summaries tailored to Austin, TX floral retailers.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              >
                View all updates
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {complianceAlerts.map((alert) => (
                <article
                  key={alert.title}
                  className="rounded-xl border border-emerald-100 bg-white/80 p-4 shadow-sm transition-colors hover:border-emerald-200 dark:border-emerald-900 dark:bg-slate-900/80 dark:hover:border-emerald-700"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
                      <alert.icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {alert.title}
                        </h3>
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {alert.summary}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
          <Card className="flex h-full flex-col justify-between border-emerald-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Upcoming deadlines
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Prioritized by proximity and impact.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-slate-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Due {item.due}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.note}
                  </p>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40"
              >
                Sync with calendar
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-emerald-100 bg-white/90 shadow-md transition-colors hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                AI Assistant
              </CardTitle>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400">
                Describe a regulation or policy challenge and get an instant summary, next steps, and recommended contacts tailored to your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300 sm:max-w-md">
                Not sure what a new rule means for you? Let the assistant break it down and outline a plan before deadlines sneak up.
              </p>
              <Button
                asChild
                variant="default"
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                <Link href="/Assistant">
                  Open AI assistant
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
