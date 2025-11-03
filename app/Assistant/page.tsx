import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ChatBox from "@/components/assistant/ChatBox";

export const metadata = {
  title: "AI Assistant",
  description: "Ask questions and get tailored small-business help.",
};

// Chat UI is implemented in a client component (ChatBox)

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <Card className="border-emerald-100 bg-white/95 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-200">
                <Sparkles className="h-5 w-5" /> AI Assistant
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Online · Here to help with growth, ops, and more
              </CardDescription>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-slate-500 dark:border-emerald-900 dark:bg-slate-900 dark:text-slate-300 sm:flex">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> New chat
            </div>
          </CardHeader>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="border-emerald-100 bg-white/95 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardContent>
              <ChatBox />
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/95 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Conversation tips
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Share a bit about your business to get more tailored responses from compl.io.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-500/10">
                Mention your location and business model if your question touches regulations or partnerships.
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-500/10">
                Ask for step-by-step checklists when you need to prepare filings, trainings, or launches.
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-500/10">
                Attach recent reports or draft copy to get sharper recommendations.
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
