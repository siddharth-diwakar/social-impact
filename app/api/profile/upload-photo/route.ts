import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}. Allowed types: JPEG, PNG, WebP` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum is 5MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${user.id}/${randomUUID()}.${fileExtension}`;
    const filePath = `avatars/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload photo" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update user metadata with avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    });

    if (updateError) {
      // Delete uploaded file if metadata update fails
      await supabase.storage.from("avatars").remove([filePath]);
      return NextResponse.json(
        { error: updateError.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

