import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const expired = searchParams.get("expired") === "true";

    // Build query - fetch documents owned by user OR shared with user
    // Using separate queries and combining results for better compatibility
    const { data: ownedDocs, error: ownedError } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (ownedError) {
      console.error("Error fetching owned documents:", ownedError);
      return NextResponse.json(
        { error: `Failed to fetch documents: ${ownedError.message}` },
        { status: 500 }
      );
    }

    // Fetch shared documents
    const { data: sharedDocs, error: sharedError } = await supabase
      .from("documents")
      .select("*")
      .contains("shared_with", [user.id])
      .order("uploaded_at", { ascending: false });

    if (sharedError) {
      console.error("Error fetching shared documents:", sharedError);
      // Continue with owned docs only if shared query fails
    }

    // Combine and deduplicate documents
    const allDocs = [...(ownedDocs || [])];
    if (sharedDocs) {
      const sharedIds = new Set(allDocs.map((d) => d.id));
      sharedDocs.forEach((doc) => {
        if (!sharedIds.has(doc.id)) {
          allDocs.push(doc);
        }
      });
    }

    // Sort by uploaded_at
    allDocs.sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );

    // Apply filters
    let filteredDocs = allDocs;

    if (category) {
      filteredDocs = filteredDocs.filter((doc) => doc.category === category);
    }

    if (tag) {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.tags && doc.tags.includes(tag)
      );
    }

    if (search) {
      const query = search.toLowerCase();
      filteredDocs = filteredDocs.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }

    // Filter by expiration if requested
    if (expired) {
      const now = new Date();
      filteredDocs = filteredDocs.filter((doc) => {
        if (!doc.expiration_date) return false;
        return new Date(doc.expiration_date) < now;
      });
    }

    // Get signed URLs for each document
    const documentsWithUrls = await Promise.all(
      filteredDocs.map(async (doc) => {
        const { data: urlData } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.file_path, 3600); // URL valid for 1 hour

        return {
          ...doc,
          downloadUrl: urlData?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ documents: documentsWithUrls });
  } catch (error) {
    console.error("Error in GET /api/documents:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get document to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([document.file_path]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/documents:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete document",
      },
      { status: 500 }
    );
  }
}

