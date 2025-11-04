import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get file content
    const { data: fileData, error: fileError } = await supabase.storage
      .from("documents")
      .download(document.file_path);

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download document" },
        { status: 500 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Extract text content from the document
    let extractedText = "";
    let extractionMethod = "";

    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (document.file_type === "application/pdf") {
        // Extract text from PDF (use dynamic import for CommonJS module)
        const pdfParseModule = await import("pdf-parse");
        // pdf-parse exports the function directly, not as default
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
        extractionMethod = "PDF text extraction";
      } else if (
        document.file_type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        document.file_type === "application/msword"
      ) {
        // Extract text from Word documents
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        extractionMethod = "Word document extraction";
      } else if (
        document.file_type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        document.file_type === "application/vnd.ms-excel"
      ) {
        // Extract text from Excel files
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetNames = workbook.SheetNames;
        const allText: string[] = [];
        
        sheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetText = XLSX.utils.sheet_to_txt(worksheet);
          allText.push(`Sheet: ${sheetName}\n${sheetText}`);
        });
        
        extractedText = allText.join("\n\n");
        extractionMethod = "Excel extraction";
      } else if (
        document.file_type === "image/png" ||
        document.file_type === "image/jpeg"
      ) {
        // For images, use OpenAI Vision API
        const base64 = buffer.toString("base64");
        const imageUrl = `data:${document.file_type};base64,${base64}`;
        
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all text from this image. If this is a document, provide a clear transcription of all visible text.",
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          max_tokens: 4000,
        });

        extractedText = visionResponse.choices[0].message.content || "";
        extractionMethod = "Image OCR via OpenAI Vision";
      } else {
        // Fallback: use filename only
        extractedText = `Filename: ${document.filename}`;
        extractionMethod = "Filename only";
      }

      // Limit extracted text to avoid token limits (keep first 8000 chars)
      if (extractedText.length > 8000) {
        extractedText =
          extractedText.substring(0, 8000) +
          "... [text truncated due to length]";
      }
    } catch (extractError) {
      console.error("Error extracting text:", extractError);
      // Fallback to filename analysis if extraction fails
      extractedText = `Filename: ${document.filename}`;
      extractionMethod = "Filename only (extraction failed)";
    }

    const categories = [
      "Tax",
      "Legal",
      "Compliance",
      "HR",
      "Finance",
      "Planning",
      "Governance",
      "Risk",
      "Operations",
    ];

    const prompt = `You are a compliance expert helping small businesses organize their documents.

Analyze this business document and provide:

1. **Category**: Choose ONE category from: ${categories.join(", ")}
2. **Tags**: Provide up to 5 relevant tags (short keywords, lowercase)
3. **Description**: A brief 1-2 sentence description of what the document is
4. **Summary**: A concise summary (2-4 sentences) of the key information, important dates, requirements, or action items mentioned in the document

Document filename: ${document.filename}
Document type: ${document.file_type}
Extraction method: ${extractionMethod}

Document content:
${extractedText}

Respond in JSON format:
{
  "category": "one of the categories above",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "brief description of the document",
  "summary": "2-4 sentence summary of key information, dates, requirements, or action items"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a compliance expert helping small businesses organize their documents.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(
        completion.choices[0].message.content || "{}"
      );

      // Update document with analysis (including summary)
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          category: analysis.category || null,
          tags: analysis.tags || [],
          description: analysis.description || null,
          summary: analysis.summary || null,
        })
        .eq("id", documentId);

      if (updateError) {
        console.error("Error updating document:", updateError);
        return NextResponse.json(
          { error: "Failed to save analysis to database" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        analysis: {
          ...analysis,
          summary: analysis.summary || analysis.description, // Include summary in response
        },
      });
    } catch (openaiError) {
      console.error("OpenAI error:", openaiError);
      return NextResponse.json(
        { error: "Failed to analyze document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in document analysis:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze document",
      },
      { status: 500 }
    );
  }
}

