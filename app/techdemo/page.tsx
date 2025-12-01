import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

export default function TechDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E1421] via-[#531324] to-[#7D3227] px-6 py-16 text-[#F3E3DF]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-10">
        <p className="text-center text-sm uppercase tracking-[0.3em] text-[#F7E2DB]/80">
          Tech Demo
        </p>
        <VercelV0Chat />
      </div>
    </div>
  );
}
