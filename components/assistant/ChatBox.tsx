"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";

type ChatMessage = {
  type: "user" | "assistant";
  label: string;
  text: string;
};

const starterIdeas = [
  "How do I prep for the new delivery ordinance?",
  "Draft an email announcing our fall subscription tier",
  "Summarize Austin's latest signage rules",
];

const initialMessages: ChatMessage[] = [
  {
    type: "assistant",
    label: "GS",
    text: "Hey there — I'm your AI assistant. What can I help you with today?",
  },
];

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function sendPrompt(prompt: string) {
    if (!prompt.trim()) return;
    const user: ChatMessage = { type: "user", label: "Me", text: prompt.trim() };
    setMessages((prev) => [...prev, user]);
    setInput("");
    setLoading(true);
    try {
      // Build message history for API
      const history = [
        { role: "system", content: "You are a helpful small-business assistant for compl.io." },
        ...messages.map((m) => ({ role: m.type, content: m.text } as const)),
        { role: "user", content: prompt.trim() },
      ] as { role: "system" | "user" | "assistant"; content: string }[];

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as { message?: string };
      const reply: ChatMessage = {
        type: "assistant",
        label: "GS",
        text: (data.message || "Sorry, I couldn't generate a response.").trim(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (e: any) {
      const reply: ChatMessage = {
        type: "assistant",
        label: "GS",
        text: `Error: ${e?.message || "Something went wrong"}`,
      };
      setMessages((prev) => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col gap-4 p-4 sm:h-[72vh] sm:p-6">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-inner dark:border-emerald-900 dark:bg-emerald-500/5"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((message, index) => {
            const isUser = message.type === "user";
            return (
              <div
                key={`${message.label}-${index}-${message.text.slice(0, 8)}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`mt-1 h-7 w-7 flex-shrink-0 rounded-full text-center text-xs font-semibold leading-7 ${
                      isUser
                        ? "bg-emerald-600 text-white dark:bg-emerald-500"
                        : "bg-white text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    }`}
                  >
                    {message.label}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl border p-3 text-sm shadow-sm ${
                      isUser
                        ? "rounded-tr-sm border-emerald-300 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-500"
                        : "rounded-tl-sm border-emerald-100 bg-white text-slate-800 dark:border-emerald-900 dark:bg-slate-900/80 dark:text-slate-200"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-7 w-7 flex-shrink-0 rounded-full bg-white text-center text-xs font-semibold leading-7 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                  GS
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-emerald-100 bg-white p-3 text-sm text-slate-800 shadow-sm dark:border-emerald-900 dark:bg-slate-900/80 dark:text-slate-200">
                  Thinking…
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form
        className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-[#EDD9D4]/30 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-slate-900/70"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) sendPrompt(input);
        }}
      >
        <Textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant about marketing, operations, staffing…"
          className="min-h-[44px] resize-none border border-[#EDD9D4]/50 bg-white text-sm text-[#3E1421] placeholder:text-[#531324] focus-visible:border-[#AF755C] focus-visible:ring-[#AF755C]/30 dark:border-emerald-900 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-400"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-[#EDD9D4] hover:bg-[#EDD9D4]/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-9 rounded-full border border-[#EDD9D4]/40 bg-[#EDD9D4] px-4 text-sm font-semibold text-[#3E1421] shadow-sm transition hover:bg-[#EDD9D4]/90 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              {loading ? "Sending" : "Send"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
        Powered by OpenAI via compl.io
      </p>
    </div>
  );
}
