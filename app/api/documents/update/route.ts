import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncDocumentToCalendar } from "@/lib/calendar-sync-utils";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, ...updates } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Verify document ownership and get current document data
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("user_id, filename, expiration_date")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    // Try to get calendar_event_id if column exists
    let existingEventId: string | null = null;
    try {
      const { data: docWithEventId } = await supabase
        .from("documents")
        .select("calendar_event_id")
        .eq("id", documentId)
        .single();
      existingEventId = docWithEventId?.calendar_event_id || null;
    } catch {
      // Column doesn't exist yet - that's okay
      existingEventId = null;
    }

    const oldExpirationDate = document.expiration_date;

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.expiration_date !== undefined)
      updateData.expiration_date = updates.expiration_date || null;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.linked_deadline_id !== undefined)
      updateData.linked_deadline_id = updates.linked_deadline_id || null;

    // Update document
    const { error: updateError } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", documentId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { 
          error: "Failed to update document",
          details: updateError.message || "Unknown error",
          code: updateError.code || "UNKNOWN"
        },
        { status: 500 }
      );
    }

    // Automatically sync to calendar if expiration_date was set or updated
    if (updates.expiration_date !== undefined) {
      const newExpirationDate = updates.expiration_date || null;
      
      // Only sync if the date actually changed or if it's being set for the first time
      if (newExpirationDate !== oldExpirationDate) {
        // Sync to calendar asynchronously (don't block the response)
        syncDocumentToCalendar(
          documentId,
          document.filename,
          newExpirationDate,
          existingEventId
        ).catch((error) => {
          // Log error but don't fail the update
          console.error("Failed to auto-sync to calendar:", error);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update document",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

