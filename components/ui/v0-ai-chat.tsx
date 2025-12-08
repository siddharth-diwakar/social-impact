"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpIcon,
  CircleUserRound,
  FileUp,
  Figma,
  ImageIcon,
  Loader2,
  MonitorIcon,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const demoScenario = {
  id: "vendor-update",
  question:
    "Has anything changed in our delivery schedule or payment terms with EduSupply after the latest contract update?",
  answer:
    "Yes. LCA_Vendor_Contract_Update.pdf shortens delivery timelines and tightens payment processing to a 21-day window. It also broadens scope to include digital learning software, extends renewals to two-year cycles, and adds annual compliance verification. All other terms from LCA_Supply_Vendor_Contract.pdf remain in effect.",
  evidence: [
    {
      label: "LCA_Vendor_Contract_Update.pdf",
      detail:
        "Amendment tightens delivery schedules, requires payments within 21 days, expands scope to software, sets two-year renewals, and adds annual compliance verification.",
    },
    {
      label: "LCA_Supply_Vendor_Contract.pdf",
      detail:
        "Original supply agreement; its baseline delivery and payment terms are superseded by the update, while other provisions continue unchanged.",
    },
  ],
  thinkingHighlight: "Comparing original vs. amended vendor terms",
  thinkingDetail:
    "Reviewing LCA_Supply_Vendor_Contract.pdf and LCA_Vendor_Contract_Update.pdf for delivery and payment changes...",
};

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
  const [typingDone, setTypingDone] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const scenario = demoScenario;

  useEffect(() => {
    setValue("");
    setShowAnswer(false);
    setIsThinking(false);
    setTypingDone(false);
    let index = 0;
    let typingInterval: ReturnType<typeof setInterval> | undefined;

    typingInterval = setInterval(() => {
      setValue(scenario.question.slice(0, index + 1));
      index += 1;
      if (index >= scenario.question.length) {
        if (typingInterval) clearInterval(typingInterval);
        setTypingDone(true);
      }
    }, 30);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [scenario]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleShowAnswer = useCallback(() => {
    if (!typingDone || showAnswer || isThinking) return;
    setIsThinking(true);
    const timeout = setTimeout(() => {
      setShowAnswer(true);
      setIsThinking(false);
    }, 900);
    return () => clearTimeout(timeout);
  }, [typingDone, showAnswer, isThinking]);

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col items-center space-y-4 rounded-3xl bg-gradient-to-br from-[#3E1421]/60 via-[#531324]/60 to-[#7D3227]/60 p-6 shadow-2xl backdrop-blur">
        <div className="flex w-full items-center justify-between text-sm text-[#F7E5E1]">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[#F4E1DC]/30 px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition hover:border-[#F4E1DC]/70"
            onClick={handleShowAnswer}
            disabled={!typingDone || showAnswer}
          >
            Next
          </button>
        </div>

        <h1 className="text-center text-4xl font-bold text-[#F3E3DF] sm:text-5xl">
          Ask anything...
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

            <div className="flex items-center justify-between gap-3 border-t border-[#F4E1DC]/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-[#F4D3CB]/80">
       
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShowAnswer}
                  disabled={!typingDone || showAnswer || isThinking}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-[#F4E1DC]/40 px-3 py-2 text-sm transition",
                    (!typingDone || showAnswer || isThinking)
                      ? "cursor-not-allowed text-[#EFD8D0]/40"
                      : "text-[#EFD8D0]/80 hover:border-[#F4E1DC]/60 hover:bg-[#4B1521]/70",
                  )}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  Show answer
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

      <div className="rounded-3xl border border-[#F4E1DC]/25 bg-gradient-to-br from-[#3E1421]/80 via-[#4D1623]/80 to-[#7D3227]/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#F6DDDA]/70">
          <span></span>
          <span>{isThinking ? "Analyzing..." : showAnswer ? "Ready" : ""}</span>
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
