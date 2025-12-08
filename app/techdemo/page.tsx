import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

export default function TechDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E1421] via-[#531324] to-[#7D3227] px-6 py-16 text-[#F3E3DF]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className="gap-2 rounded-full border border-[#F4E1DC]/25 bg-white/5 px-4 text-sm text-[#F3E3DF] hover:bg-white/10"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <p className="text-center text-sm uppercase tracking-[0.3em] text-[#F7E2DB]/80">
            
          </p>
          <VercelV0Chat />
        </div>
      </div>
    </div>
  );
}
