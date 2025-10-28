'use client';

import { useState } from "react";

import { Button } from "@/components/ui/button";

const exampleTags = [
  "Floral & Agriculture",
  "Food & Beverage",
  "Professional Services",
  "Local Residents",
  "Event Planners",
  "Online Shoppers (Nationwide)",
  "Retailer — Hybrid (Online + Store)",
];

type ApiResponse = {
  tags: string[];
  reason: string | null;
};

export function SampleTagDemo() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTagging = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sampleDocument: "cottage-food",
          tags: exampleTags,
          maxTags: 4,
        }),
      });

      if (!res.ok) {
        const details = await res.json().catch(() => ({}));
        throw new Error(details?.error || "Request failed");
      }

      const body = await res.json();
      setData({ tags: body.tags ?? [], reason: body.reason ?? null });
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white/90 p-4 text-sm text-slate-700 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/60 dark:text-slate-200">
      <div>
        <p className="font-semibold">Demo: Tag the Cottage Food guide</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sends the sample PDF through the OpenAI tagging endpoint using the tags below.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {exampleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Button
        type="button"
        onClick={runTagging}
        disabled={loading}
        className="w-fit rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
      >
        {loading ? "Tagging..." : "Run tagging demo"}
      </Button>
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {data ? (
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-600 dark:text-slate-300">Tagged as:</p>
          <div className="flex flex-wrap gap-2">
            {data.tags.length > 0 ? (
              data.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span>No matching tags</span>
            )}
          </div>
          {data.reason ? (
            <p className="text-slate-500 dark:text-slate-400">Reason: {data.reason}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
