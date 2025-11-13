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
    <div className="min-h-screen text-[#EDD9D4]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="w-fit gap-2 text-sm text-[#EDD9D4] hover:bg-[#EDD9D4]/10"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <Card className="glass-panel border border-[#EDD9D4]/25">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-[#EDD9D4]">
                <Sparkles className="h-5 w-5" /> AI Assistant
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-[#EDD9D4]/70">
                Online · Here to help with growth, ops, and more
              </CardDescription>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[#EDD9D4]/30 bg-[#3E1421]/40 px-3 py-1 text-xs text-[#EDD9D4]/70 sm:flex">
              <span className="inline-block h-2 w-2 rounded-full bg-[#EDD9D4]" /> New chat
            </div>
          </CardHeader>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="glass-panel border border-[#EDD9D4]/25">
            <CardContent>
              <ChatBox />
            </CardContent>
          </Card>

          <Card className="glass-panel border border-[#EDD9D4]/25">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#EDD9D4]">
                Conversation tips
              </CardTitle>
              <CardDescription className="text-sm text-[#EDD9D4]/70">
                Share a bit about your business to get more tailored responses from compl.io.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[#EDD9D4]/90">
              <div className="rounded-xl border border-[#EDD9D4]/20 bg-[#3E1421]/60 p-3">
                Mention your location and business model if your question touches regulations or partnerships.
              </div>
              <div className="rounded-xl border border-[#EDD9D4]/20 bg-[#3E1421]/60 p-3">
                Ask for step-by-step checklists when you need to prepare filings, trainings, or launches.
              </div>
              <div className="rounded-xl border border-[#EDD9D4]/20 bg-[#3E1421]/60 p-3">
                Attach recent reports or draft copy to get sharper recommendations.
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
