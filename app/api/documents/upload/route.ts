import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "image/png",
  "image/jpeg",
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 files allowed" },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: `File type not allowed: ${file.type}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum is 10MB`,
        });
        continue;
      }

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${user.id}/${timestamp}-${sanitizedFilename}`;

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from("documents")
            .upload(filePath, fileBuffer, {
              contentType: file.type,
              upsert: false,
            });

        if (uploadError) {
          uploadResults.push({
            filename: file.name,
            success: false,
            error: uploadError.message,
          });
          continue;
        }

        // Save metadata to database
        const { data: docData, error: dbError } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            filename: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
          })
          .select()
          .single();

        if (dbError) {
          // If database insert fails, try to delete the uploaded file
          await supabase.storage.from("documents").remove([filePath]);
          uploadResults.push({
            filename: file.name,
            success: false,
            error: dbError.message,
          });
          continue;
        }

        uploadResults.push({
          filename: file.name,
          success: true,
          document: docData,
        });
      } catch (error) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

    const successCount = uploadResults.filter((r) => r.success).length;
    const failureCount = uploadResults.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Uploaded ${successCount} file(s) successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
      results: uploadResults,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload documents",
      },
      { status: 500 }
    );
  }
}

