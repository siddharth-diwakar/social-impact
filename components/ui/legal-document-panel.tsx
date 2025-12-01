"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { LegalDocument } from "@/lib/data/legal-docs";

interface LegalDocumentPanelProps {
  documents: LegalDocument[];
  activeDocId?: string;
  activeSectionId?: string;
  title?: string;
  description?: string;
}

export function LegalDocumentPanel({
  documents,
  activeDocId,
  activeSectionId,
  title = "Linked authority",
  description = "Preview the clauses the assistant cites in each answer.",
}: LegalDocumentPanelProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!activeDocId || !activeSectionId) {
      return;
    }
    const key = `${activeDocId}-${activeSectionId}`;
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[#FDE68A]", "shadow-lg");
      const timeout = window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-[#FDE68A]", "shadow-lg");
      }, 1800);
      return () => window.clearTimeout(timeout);
    }
  }, [activeDocId, activeSectionId]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_40px_120px_-60px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-[#FDE68A]">
          Source docs
        </p>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-white/70">{description}</p>
      </div>

      <div className="space-y-5">
        {documents.map((doc) => (
          <article
            key={doc.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner"
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{doc.title}</span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/70">
                {doc.type}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">{doc.description}</p>
            <div className="mt-4 space-y-3 overflow-hidden">
              {doc.sections.map((section) => {
                const isActive =
                  doc.id === activeDocId && section.id === activeSectionId;
                return (
                  <div
                    key={section.id}
                    ref={(element) => {
                      sectionRefs.current[`${doc.id}-${section.id}`] = element;
                    }}
                    className={cn(
                      "rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition",
                      isActive && "bg-[#FDE68A]/15 text-white shadow-lg",
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                      {section.heading}
                    </p>
                    <p className="mt-1 leading-relaxed">{section.excerpt}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

