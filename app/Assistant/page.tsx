import Link from "next/link";
import { ArrowLeft, Paperclip, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "AI Assistant",
  description: "Ask questions and get tailored small-business help.",
};

const sampleMessages = [
  {
    type: "assistant",
    label: "GS",
    text: "Hey there — I'm your AI assistant. What can I help you with today?",
  },
  {
    type: "user",
    label: "Me",
    text: "I'm planning a fall promo. Any quick ideas to boost foot traffic on weekends?",
  },
  {
    type: "assistant",
    label: "GS",
    text: "Try a \"Local Harvest Weekend\" theme with partner coupons from nearby cafes and a limited bundle. Add a social post template and a QR that links to your best-seller.",
  },
];

const starterIdeas = [
  "How do I prep for the new delivery ordinance?",
  "Draft an email announcing our fall subscription tier",
  "Summarize Austin's latest signage rules",
];

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
            <CardContent className="flex h-[70vh] flex-col gap-4 p-4 sm:h-[72vh] sm:p-6">
              <div className="flex-1 overflow-y-auto rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-inner dark:border-emerald-900 dark:bg-emerald-500/5">
                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                  {sampleMessages.map((message, index) => {
                    const isUser = message.type === "user";
                    return (
                      <div
                        key={`${message.label}-${index}`}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`mt-1 h-7 w-7 flex-shrink-0 rounded-full text-center text-xs font-semibold leading-7 ${
                              isUser
                                ? "bg-emerald-600 text-white dark:bg-emerald-500"
                                : "bg-white text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                            }`}
                          >
                            {message.label}
                          </div>
                          <div
                            className={`max-w-[85%] rounded-2xl border p-3 text-sm shadow-sm ${
                              isUser
                                ? "rounded-tr-sm border-emerald-300 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-500"
                                : "rounded-tl-sm border-emerald-100 bg-white text-slate-800 dark:border-emerald-900 dark:bg-slate-900/80 dark:text-slate-200"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm dark:border-emerald-900 dark:bg-slate-900/70">
                <Textarea
                  rows={3}
                  placeholder="Ask the assistant about marketing, operations, staffing…"
                  className="min-h-[44px] resize-none border border-emerald-200 bg-white text-sm text-slate-800 placeholder:text-slate-500 focus-visible:border-emerald-400 focus-visible:ring-emerald-500/30 dark:border-emerald-900 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {starterIdeas.map((idea) => (
                      <Button
                        key={idea}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full bg-emerald-50 px-3 text-xs text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                      >
                        {idea}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                      aria-label="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      className="h-9 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                    >
                      Send
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                Demo only — connect to your API or server actions to enable real chat.
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/95 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Conversation tips
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Give GreenSage context to get more tailored responses.
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
