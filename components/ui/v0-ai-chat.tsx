"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpIcon,
  CircleUserRound,
  FileUp,
  Figma,
  ImageIcon,
  Loader2,
  MonitorIcon,
  Paperclip,
  PlusIcon,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const demoScenarios = [
  {
    id: "tenant",
    title: "Rent notice dispute",
    question:
      "Can my landlord increase rent without any notice under California law if I'm locked into a one-year lease?",
    answer:
      'California Civil Code § 827(b) limits mid-lease increases unless your landlord provides 30 days’ written notice (60 days if the increase exceeds 10%). The “Tenant Rights Handbook.pdf” you uploaded echoes this on page 18: “During a fixed-term tenancy, rent adjustments require statutory notice even when the lease is silent.” Because your lease runs until April 2025, an immediate rent jump would violate § 827(b) and the notice clause your handbook quotes.',
    evidence: [
      {
        label: "California Civil Code § 827(b)",
        detail:
          "Requires 30–60 days written notice before changing rent during a fixed-term tenancy.",
      },
      {
        label: "Tenant Rights Handbook.pdf (uploaded)",
        detail:
          "Page 18 restates that notice must match the timelines in § 827 before any rent modification takes effect.",
      },
    ],
    thinkingHighlight: "Reviewing Tenant Rights Handbook.pdf",
    thinkingDetail:
      "Checking California Civil Code § 827(b) for notice requirements...",
  },
  {
    id: "noncompete",
    title: "Non-compete review",
    question:
      "Is the two-year non-compete clause in my Texas employment contract enforceable if my role changed after signing?",
    answer:
      "Texas Business & Commerce Code § 15.50 only enforces non-competes that are ancillary to an otherwise enforceable agreement and no broader than necessary. Your uploaded “Sales Comp Agreement.docx” limits post-employment restrictions to counties you actually serviced. Because your new duties cover different territories and the restriction still spans every Texas county for 24 months, it’s broader than § 15.50 allows. The agreement’s recital on page 3 confirms the role change without a new covenant, so the clause is likely unenforceable as written.",
    evidence: [
      {
        label: "Texas Business & Commerce Code § 15.50",
        detail:
          "Requires non-competes to be tied to consideration and limited to actual territory/duration.",
      },
      {
        label: "Sales Comp Agreement.docx (uploaded)",
        detail:
          "Page 3 notes your reassignment to enterprise accounts without revising the territorial scope of the covenant.",
      },
    ],
    thinkingHighlight: "Scanning Sales Comp Agreement.docx",
    thinkingDetail:
      "Comparing covenant scope with Texas Business & Commerce Code § 15.50...",
  },
  {
    id: "gdpr",
    title: "GDPR deletion",
    question:
      "How fast do we need to erase a customer’s data once they send a GDPR right-to-erasure request through our portal?",
    answer:
      "GDPR Article 17 requires erasure “without undue delay,” and Recital 65 ties that to your retention schedule. Your “DPA_with_Northwind.pdf” says backups purge within 30 days. Because the only lawful basis you list in the DPA is consent, once revoked you must delete production records immediately and ensure backups drop the identifiers in their next scheduled purge. The DPA’s Appendix 2 documents that purge cadence (weekly differential, 30-day full delete), which meets Article 17 as long as you log completion.",
    evidence: [
      {
        label: "GDPR Article 17",
        detail:
          "Mandates prompt deletion when the data subject withdraws consent and no alternative legal basis applies.",
      },
      {
        label: "DPA_with_Northwind.pdf (uploaded)",
        detail:
          "Appendix 2 documents weekly differential backups and a 30-day retention window for full snapshot removal.",
      },
    ],
    thinkingHighlight: "Reviewing DPA_with_Northwind.pdf",
    thinkingDetail:
      "Mapping GDPR Article 17 obligations to your documented retention schedule...",
  },
];

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY,
        ),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const scenario = demoScenarios[activeScenario];

  const goToScenario = useCallback((direction: "next" | "prev") => {
    setActiveScenario((prev) => {
      if (direction === "next") {
        return (prev + 1) % demoScenarios.length;
      }
      return (prev - 1 + demoScenarios.length) % demoScenarios.length;
    });
  }, []);

  useEffect(() => {
    setValue("");
    setShowAnswer(false);
    setIsThinking(false);
    let index = 0;
    let typingInterval: ReturnType<typeof setInterval> | undefined;
    let thinkingTimeout: ReturnType<typeof setTimeout> | undefined;

    typingInterval = setInterval(() => {
      setValue(scenario.question.slice(0, index + 1));
      index += 1;
      if (index >= scenario.question.length) {
        if (typingInterval) clearInterval(typingInterval);
        setIsThinking(true);
        thinkingTimeout = setTimeout(() => {
          setShowAnswer(true);
          setIsThinking(false);
        }, 2400);
      }
    }, 30);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      if (thinkingTimeout) clearTimeout(thinkingTimeout);
    };
  }, [scenario]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    if (!showAnswer) return;
    const autoAdvance = setTimeout(() => {
      goToScenario("next");
    }, 5000);
    return () => clearTimeout(autoAdvance);
  }, [showAnswer, goToScenario]);

  const dots = useMemo(
    () =>
      demoScenarios.map((item, index) => ({
        id: item.id,
        isActive: index === activeScenario,
      })),
    [activeScenario],
  );

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col items-center space-y-4 rounded-3xl bg-gradient-to-br from-[#3E1421]/60 via-[#531324]/60 to-[#7D3227]/60 p-6 shadow-2xl backdrop-blur">
        <div className="flex w-full items-center justify-between text-sm text-[#F7E5E1]">
          <button
            type="button"
            onClick={() => goToScenario("prev")}
            className="flex items-center gap-2 rounded-full border border-[#F4E1DC]/30 px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition hover:border-[#F4E1DC]/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-xs uppercase tracking-[0.3em] text-[#F8EAE7]/80">
            {scenario.title}
          </span>
          <button
            type="button"
            onClick={() => goToScenario("next")}
            className="flex items-center gap-2 rounded-full border border-[#F4E1DC]/30 px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition hover:border-[#F4E1DC]/70"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <h1 className="text-center text-4xl font-bold text-[#F3E3DF] sm:text-5xl">
          What can I help you ship?
        </h1>

        <div className="w-full">
          <div className="relative rounded-2xl border border-[#F4E1DC]/20 bg-[#36101C]/80 shadow-xl">
            <div className="overflow-y-auto">
              <Textarea
                ref={textareaRef}
                value={value}
                readOnly
                placeholder="Ask our co-pilot a question..."
                className={cn(
                  "min-h-[60px] w-full resize-none border-0 bg-transparent px-5 py-4 text-base text-[#F8EAE7]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-[#E3C3BB]/80",
                )}
                style={{
                  overflow: "hidden",
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F4E1DC]/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#EFD8D0]/70 transition hover:bg-[#4B1521]/70"
                >
                  <Paperclip className="h-4 w-4 text-[#F6DBD5]" />
                  <span className="hidden text-xs text-[#F6DBD5] group-hover:inline">
                    Attach
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-dashed border-[#F4E1DC]/30 px-3 py-2 text-sm text-[#EDD9D4] transition hover:border-[#F4E1DC]/60 hover:bg-[#4B1521]/70"
                >
                  <PlusIcon className="h-4 w-4" />
                  Project
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-[#F4E1DC]/40 px-3 py-2 text-sm text-[#EFD8D0]/60 transition"
                >
                  <ArrowUpIcon className="h-4 w-4 text-[#EFD8D0]/60" />
                  <span className="sr-only">Send</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <ActionButton
              icon={<ImageIcon className="h-4 w-4" />}
              label="Clone a Screenshot"
            />
            <ActionButton icon={<Figma className="h-4 w-4" />} label="Import from Figma" />
            <ActionButton icon={<FileUp className="h-4 w-4" />} label="Upload a Project" />
            <ActionButton icon={<MonitorIcon className="h-4 w-4" />} label="Landing Page" />
            <ActionButton
              icon={<CircleUserRound className="h-4 w-4" />}
              label="Sign Up Form"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {dots.map((dot) => (
          <button
            key={dot.id}
            type="button"
            onClick={() =>
              setActiveScenario(demoScenarios.findIndex((s) => s.id === dot.id))
            }
            className={cn(
              "h-2.5 w-2.5 rounded-full transition",
              dot.isActive
                ? "bg-[#F8EAE7]"
                : "bg-[#F4D3CB]/40 hover:bg-[#F8EAE7]/60",
            )}
            aria-label={`Show scenario ${dot.id}`}
          />
        ))}
      </div>

      <div className="rounded-3xl border border-[#F4E1DC]/25 bg-gradient-to-br from-[#3E1421]/80 via-[#4D1623]/80 to-[#7D3227]/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#F6DDDA]/70">
          <span>AI Response</span>
          <span>{isThinking ? "Analyzing..." : showAnswer ? "Ready" : "Idle"}</span>
        </div>

        {isThinking && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#F4E1DC]/20 bg-[#42131F]/80 px-4 py-4 text-sm text-[#F8EAE7]">
            <Loader2 className="h-5 w-5 animate-spin text-[#F8EAE7]" />
            <div>
              <p className="font-medium">{scenario.thinkingHighlight}</p>
              <p className="text-xs text-[#F4D3CB]">{scenario.thinkingDetail}</p>
            </div>
          </div>
        )}

        {showAnswer && !isThinking && (
          <div className="mt-5 space-y-5 text-[#F8EAE7]">
            <p className="text-lg leading-relaxed text-[#F9ECE9]">{scenario.answer}</p>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#F6DDDA]/70">
                Supporting Evidence
              </p>
              <ul className="mt-3 space-y-3">
                {scenario.evidence.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-2xl border border-[#F4E1DC]/20 bg-[#4A1522]/70 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#FDF2EF]">{item.label}</p>
                    <p className="text-sm text-[#F3D4CD]">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-[#F4E1DC]/15 bg-[#4B1521]/70 px-4 py-2 text-xs font-medium text-[#F6DDDA] transition hover:border-[#F4E1DC]/50 hover:bg-[#5A1928]/80"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
