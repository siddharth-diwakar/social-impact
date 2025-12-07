"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ScanLine, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Segment = {
  id: string;
  label: string;
  source: string;
};

type LanguageRun = {
  key: string;
  label: string;
  targets: Record<string, string>;
};

const segments: Segment[] = [
  {
    id: "memo",
    label: "Policy memo",
    source:
      "Our partners asked for faster bilingual updates when we change our safety commitments. This memo shows exactly how we roll out revisions.",
  },
  {
    id: "owners",
    label: "Owner notes",
    source:
      "Each clause is annotated with policy owners and the local orgs impacted so nothing is lost during audits.",
  },
  {
    id: "trace",
    label: "AI trace",
    source:
      "AI highlights risky language, drafts Spanish and English side by side, and leaves a visible trace so reviewers understand every adjustment.",
  },
];

const languageRuns: LanguageRun[] = [
  {
    key: "spanish",
    label: "Spanish",
    targets: {
      memo:
        "Nuestros socios pidieron actualizaciones bilingues mas rapidas cuando cambiamos nuestros compromisos de seguridad. Esta nota muestra exactamente como desplegamos las revisiones.",
      owners:
        "Cada clausula se anota con los responsables de la politica y las organizaciones locales afectadas para que nada se pierda durante las auditorias.",
      trace:
        "La IA resalta lenguaje riesgoso, redacta en espanol e ingles en paralelo y deja un rastro visible para que los revisores entiendan cada ajuste.",
    },
  },
  {
    key: "french",
    label: "French",
    targets: {
      memo:
        "Nos partenaires ont demande des mises a jour bilingues plus rapides lorsque nous modifions nos engagements de securite. Cette note montre exactement comment nous deployons les revisions.",
      owners:
        "Chaque clause est annotee avec les responsables et les organisations locales impactees afin que rien ne se perde pendant les audits.",
      trace:
        "L IA souligne le langage a risque, redige en francais et en anglais cote a cote et laisse une trace visible pour que les controleurs comprennent chaque ajustement.",
    },
  },
  {
    key: "german",
    label: "German",
    targets: {
      memo:
        "Unsere Partner baten um schnellere zweisprachige Updates, wenn wir unsere Sicherheitszusagen aendern. Dieses Memo zeigt genau, wie wir Anpassungen ausrollen.",
      owners:
        "Jede Klausel ist mit Verantwortlichen und betroffenen lokalen Organisationen gekennzeichnet, damit nichts in Audits verloren geht.",
      trace:
        "Die KI markiert riskante Formulierungen, schreibt Deutsch und Englisch nebeneinander und hinterlaesst eine sichtbare Spur, damit Pruefer jede Anpassung verstehen.",
    },
  },
  {
    key: "hindi",
    label: "Hindi",
    targets: {
      memo:
        "Hamare saathi chahte hain ki suraksha badlav ke samay do bhashaon me tez updates mile. Ye memo dikhata hai ki hum badlav kaise jari karte hain.",
      owners:
        "Har clause par policy ke zimmedar aur prabhavit sthaniya sangathan likhe hain, taki audits me kuch bhi na chute.",
      trace:
        "AI khatarnak bhasha ko highlight karti hai, Hindi aur English ko saath me likhti hai, aur ek dikhai dene wala trace chhodti hai taki reviewers har badlav samajh saken.",
    },
  },
];

let runningOffset = 0;
const segmentOffsets = segments.reduce<Record<string, number>>((map, item) => {
  map[item.id] = runningOffset;
  runningOffset += item.source.split(/\s+/).filter(Boolean).length;
  return map;
}, {});

const wordTimeline = segments.flatMap((segment) =>
  segment.source
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({
      word,
      section: segment.id,
    })),
);

export default function TranslatePage() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [languageIndex, setLanguageIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [completedSections, setCompletedSections] = useState<
    Record<string, boolean>
  >({});

  const currentLanguage = languageRuns[languageIndex] ?? languageRuns[0];

  useEffect(() => {
    if (!isTranslating) return;

    let index = 0;
    let timeout: ReturnType<typeof setTimeout>;
    let advanceTimeout: ReturnType<typeof setTimeout>;

    setActiveIndex(0);
    setRevealedCount(0);
    setCompletedSections({});

    const step = () => {
      setActiveIndex(index);
      setRevealedCount(index + 1);

      const isLastWord = index === wordTimeline.length - 1;
      const section = wordTimeline[index].section;
      const nextSection = wordTimeline[index + 1]?.section;
      const finishedSection = isLastWord || nextSection !== section;

      if (finishedSection) {
        setCompletedSections((prev) => ({ ...prev, [section]: true }));
      }

      index += 1;
      if (index < wordTimeline.length) {
        timeout = setTimeout(step, 190);
      } else {
        setActiveIndex(null);
        setIsTranslating(false);

        const hasNextLanguage = languageIndex < languageRuns.length - 1;
        if (hasNextLanguage) {
          advanceTimeout = setTimeout(() => {
            setLanguageIndex((prev) => Math.min(prev + 1, languageRuns.length - 1));
            setIsTranslating(true);
          }, 500);
        }
      }
    };

    timeout = setTimeout(step, 95);
    return () => {
      clearTimeout(timeout);
      clearTimeout(advanceTimeout);
    };
  }, [isTranslating, languageIndex]);

  useEffect(() => {
    // When the language changes, clear visible state so previous cards disappear.
    setCompletedSections({});
    setActiveIndex(null);
    setRevealedCount(0);
  }, [languageIndex]);

  const progress =
    wordTimeline.length === 0
      ? 0
      : Math.round((revealedCount / wordTimeline.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E1421] via-[#531324] to-[#7D3227] text-[#F3E3DF]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-[#AF755C]/50 bg-[#3E1421]/70 p-4 shadow-[0_30px_120px_-40px_rgba(237,217,212,0.45)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-[#F7E2DB] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
            <span className="rounded-full border border-[#AF755C]/60 bg-[#531324]/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#F7E2DB]/80">
              Smart document highlighting
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#AF755C]/40 bg-[#7D3227]/60 px-3 py-1 text-xs text-[#F7E2DB]/80">
              <ScanLine className="h-4 w-4 text-[#EDD9D4]" />
              Live AI trace
            </div>
            <Button
              onClick={() => {
                if (isTranslating) return;
                setLanguageIndex(0);
                setCompletedSections({});
                setRevealedCount(0);
                setActiveIndex(null);
                setIsTranslating(true);
              }}
              disabled={isTranslating}
              className="gap-2 border border-[#AF755C]/70 bg-[#7D3227] text-[#F7E2DB] shadow-[0_10px_40px_-20px_rgba(237,217,212,0.7)] transition hover:bg-[#531324]"
            >
              <Wand2 className="h-4 w-4" />
              {isTranslating
                ? `Tracing ${currentLanguage.label}`
                : "Smart Translate"}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-[#AF755C]/50 bg-[#3E1421]/70 p-6 shadow-[0_25px_100px_-40px_rgba(237,217,212,0.5)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_10%_10%,rgba(237,217,212,0.12),transparent),radial-gradient(90%_70%_at_90%_0%,rgba(175,117,92,0.14),transparent)]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#F7E2DB]/80">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
                English document
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F7E2DB]/70">
                <Sparkles className="h-4 w-4 text-[#F7E2DB]" />
                Words highlight as they translate
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {segments.map((segment) => {
                const words = segment.source
                  .split(/\s+/)
                  .filter((word) => word.trim().length > 0);
                const offset = segmentOffsets[segment.id];

                return (
                  <div
                    key={segment.id}
                    className="rounded-2xl border border-[#AF755C]/40 bg-[#531324]/60 p-4 shadow-[0_15px_80px_-50px_rgba(237,217,212,0.6)]"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#F7E2DB]/70">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#AF755C]" />
                        {segment.label}
                      </span>
                      <span className="text-[11px] text-[#EDD9D4]/60">
                        {offset + 1} - {offset + words.length}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-1 gap-y-2 leading-relaxed">
                      {words.map((word, wordIndex) => {
                        const globalIndex = offset + wordIndex;
                        const isActive = activeIndex === globalIndex;
                        const isDone = globalIndex < revealedCount;

                        return (
                          <span
                            key={`${segment.id}-${word}-${wordIndex}`}
                            className={`relative inline-flex items-center overflow-hidden rounded-md px-1 py-0.5 transition-all ${
                              isActive
                                ? "text-white shadow-[0_0_0_1px_rgba(237,217,212,0.5)]"
                                : isDone
                                  ? "text-[#F7E2DB]"
                                  : "text-[#F7E2DB]/55"
                            }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="spotlight"
                                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28),rgba(175,117,92,0.1))]"
                                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{word}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-[#AF755C]/50 bg-[#3E1421]/70 p-6 shadow-[0_25px_100px_-40px_rgba(237,217,212,0.5)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#F7E2DB]/80">
                <Wand2 className="h-4 w-4 text-[#F7E2DB]" />
                {currentLanguage.label} output
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F7E2DB]/70">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isTranslating ? "bg-amber-300 animate-pulse" : "bg-emerald-300"
                  }`}
                />
                {isTranslating ? "Translating live" : "Ready"}
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#EDD9D4]/10">
              <motion.div
                className="h-full rounded-full bg-[#AF755C]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {segments.map((segment) => {
                  const visible = completedSections[segment.id];
                  const targetCopy =
                    currentLanguage.targets[segment.id] ?? "Loading...";

                  return (
                    visible && (
                      <motion.div
                        key={`target-${currentLanguage.key}-${segment.id}`}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="rounded-2xl border border-[#AF755C]/40 bg-[#531324]/60 p-4"
                      >
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#F7E2DB]/70">
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#AF755C]" />
                            {segment.label}
                          </span>
                          <span className="flex items-center gap-2 text-[11px] text-[#EDD9D4]/60">
                            <Check className="h-4 w-4 text-emerald-300" />
                            traced
                          </span>
                        </div>
                        <p className="mt-3 text-lg leading-relaxed text-[#F7E2DB]">
                          {targetCopy}
                        </p>
                      </motion.div>
                    )
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
