import { NextResponse } from "next/server";

import { promises as fs } from "fs";
import path from "path";

import OpenAI from "openai";

type TaggingRequest = {
  document?: string;
  tags: string[];
  maxTags?: number;
  sampleDocument?: "cottage-food";
};

const MAX_DOCUMENT_LENGTH = 6_000;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TaggingRequest;
    if (!body || !Array.isArray(body.tags) || body.tags.length === 0) {
      return NextResponse.json(
        { error: "tags array is required" },
        { status: 400 },
      );
    }

    let document = body.document ?? "";

    if (!document && body.sampleDocument === "cottage-food") {
      const filePath = path.join(
        process.cwd(),
        "app",
        "api",
        "reminders",
        "cottage-food-guide.txt",
      );
      document = await fs.readFile(filePath, "utf-8");
    }

    if (!document) {
      return NextResponse.json(
        { error: "document text is required" },
        { status: 400 },
      );
    }

    const documentSnippet = document.slice(0, MAX_DOCUMENT_LENGTH);
    const tagOptions = body.tags.map((tag) => tag.trim()).filter(Boolean);
    const maxTags = body.maxTags && body.maxTags > 0 ? body.maxTags : 5;

    const systemPrompt = `You are an assistant that assigns tags to regulatory or business documents for the compl.io compliance platform.
- Only select from the provided tag list.
- Pick the tags that best match the document.
- Return a strict JSON object: {\n  "tags": ["tag-a", "tag-b"],\n  "reason": "short explanation"\n}
- If nothing fits, return an empty array.
- Never invent new tags.
`;

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY env var.");
    }
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Document snippet:\n"""${documentSnippet}"""\n\nAvailable tags:${tagOptions
            .map((tag) => `\n- ${tag}`)
            .join("")}\n\nReturn up to ${maxTags} tags in JSON.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    console.log("monkey")

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    let parsed: { tags?: string[]; reason?: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { tags: [], reason: "Unable to parse model response" };
    }

    const uniqueTags = Array.from(
      new Set((parsed.tags ?? []).filter((tag) => tagOptions.includes(tag))),
    ).slice(0, maxTags);

    return NextResponse.json({
      tags: uniqueTags,
      reason: parsed.reason ?? null,
      usage: completion.usage ?? null,
    });
  } catch (error) {
    console.error("/api/reminders error", error);
    return NextResponse.json({ error: "Tagging error" }, { status: 500 });
  }
}
