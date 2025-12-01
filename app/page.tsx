import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/ui/animated-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const stats = [
  { label: "Policies tracked", value: "2,400+" },
  { label: "Hours saved / month", value: "16" },
  { label: "Active local partners", value: "85" },
];

export default function Home() {
  return (
    <div
      // Updated hero gradient now flows from the Figma mid tone (#7D3227) through the dark tone (#531324) into the darkest anchor (#3E1421).
      className="min-h-screen bg-gradient-to-b from-[#7D3227] via-[#531324] to-[#3E1421] text-[#EDD9D4] transition-colors"
    >
      <header className="sticky top-0 z-50 border-b border-[#531324] bg-[#3E1421]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg font-semibold text-[#EDD9D4] transition-colors hover:text-white"
            >
              compl.io
            </Link>
            <Badge
              variant="secondary"
              className="hidden border border-[#EDD9D4]/40 bg-[#531324] px-3 py-1 text-xs uppercase tracking-wide text-[#EDD9D4]/80 sm:inline-flex"
            >
              Live product preview
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Suspense fallback={<Button size="sm">Loading</Button>}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#AF755C]/60 bg-[#531324]/70 p-2 shadow-[0_30px_120px_-40px_rgba(237,217,212,0.6)]">
          <div
            // Inner hero container gradient now also respects the mid→darkest transition using (#7D3227 → #531324 → #3E1421).
            className="rounded-[calc(1.5rem-0.5rem)] bg-gradient-to-br from-[#7D3227] via-[#531324] to-[#3E1421] p-2"
          >
            <Hero />
          </div>
          <div className="grid gap-4 border-t border-[#AF755C]/50 px-6 py-8 text-center text-sm uppercase tracking-[0.3em] text-[#EDD9D4]/70 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-semibold text-[#EDD9D4]">
                  {stat.value}
                </p>
                <p className="text-xs tracking-[0.3em] text-[#EDD9D4]/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
