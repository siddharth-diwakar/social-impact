import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
  prompt?: string;
  system?: string;
  temperature?: number;
  model?: string;
};

const DEFAULT_SYSTEM =
  "You are a helpful small-business assistant for compl.io. Be concise and practical, and provide step-by-step guidance where helpful.";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest | null;

    if (!body) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY server env var" },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey });

    const messages: ChatMessage[] = body.messages && body.messages.length
      ? body.messages
      : [
          { role: "system", content: body.system || DEFAULT_SYSTEM },
          ...(body.prompt ? [{ role: "user", content: body.prompt }] : []),
        ];

    // Ensure there's always a system prompt at the start
    if (!messages.find((m) => m.role === "system")) {
      messages.unshift({ role: "system", content: body.system || DEFAULT_SYSTEM });
    }

    const completion = await openai.chat.completions.create({
      model: body.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: typeof body.temperature === "number" ? body.temperature : 0.3,
      messages,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      message: content,
      usage: completion.usage ?? null,
    });
  } catch (error) {
    console.error("/api/assistant error", error);
    return NextResponse.json({ error: "Assistant error" }, { status: 500 });
  }
}
