"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

type RecommendedDoc = {
  name: string;
};

type RecommendedChecklistProps = {
  docs: RecommendedDoc[];
};

export function RecommendedChecklist({ docs }: RecommendedChecklistProps) {
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const toggleDoc = (name: string) => {
    setAdded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <>
      {docs.map((doc) => {
        const isAdded = Boolean(added[doc.name]);
        return (
          <div
            key={doc.name}
            className="flex flex-col justify-between rounded-xl border border-emerald-100 bg-white/80 p-4 shadow-xs transition-colors hover:border-emerald-200 dark:border-emerald-900/60 dark:bg-slate-900/80 dark:hover:border-emerald-700"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {doc.name}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleDoc(doc.name)}
              className={`mt-4 w-fit gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                isAdded
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:border-emerald-600 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-100"
                  : "border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40"
              }`}
              aria-pressed={isAdded}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-sm border transition-colors ${
                  isAdded
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-emerald-200 bg-white dark:border-emerald-800 dark:bg-slate-900"
                }`}
              >
                {isAdded ? <Check className="h-3 w-3" /> : null}
              </span>
              <span>{isAdded ? "Added" : "Mark as added"}</span>
            </Button>
          </div>
        );
      })}
    </>
  );
}
