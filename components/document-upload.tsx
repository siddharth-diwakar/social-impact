"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  UploadCloud,
  Download,
  Trash2,
  Loader2,
  X,
  Search,
  Filter,
  Eye,
  Sparkles,
  Calendar,
  Share2,
  Edit,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DocumentPreview } from "@/components/document-preview";

interface Document {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  downloadUrl: string | null;
  category?: string | null;
  tags?: string[] | null;
  expiration_date?: string | null;
  description?: string | null;
  summary?: string | null;
  shared_with?: string[] | null;
  linked_deadline_id?: string | null;
}

interface DocumentUploadProps {
  initialDocuments?: Document[];
}

const CATEGORIES = [
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

export function DocumentUpload({ initialDocuments = [] }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [showExpired, setShowExpired] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [analyzingDoc, setAnalyzingDoc] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState({
    category: "",
    tags: [] as string[],
    expiration_date: "",
    description: "",
  });
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        const docs = data.documents || [];
        setDocuments(docs);
        return docs;
      } else {
        console.error("Failed to fetch documents:", response.status);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    return [];
  }, []);

  // Initial load - always fetch to get latest documents
  useEffect(() => {
    // Use initialDocuments if available, but also fetch to ensure we have latest
    if (initialDocuments.length > 0) {
      setDocuments(initialDocuments);
      setFilteredDocuments(initialDocuments);
    }
    // Always fetch on mount to get latest documents (especially after uploads)
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Filter documents client-side for instant feedback
  useEffect(() => {
    let filtered = documents;

    // Client-side search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }

    // Client-side category filter
    if (selectedCategory) {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Client-side tag filter
    if (selectedTag) {
      filtered = filtered.filter(
        (doc) => doc.tags && doc.tags.includes(selectedTag)
      );
    }

    // Client-side expiration filter
    if (showExpired) {
      const now = new Date();
      filtered = filtered.filter((doc) => {
        if (!doc.expiration_date) return false;
        return new Date(doc.expiration_date) < now;
      });
    }

    setFilteredDocuments(filtered);
    // Reset showAllDocuments when filters change
    if (searchQuery || selectedCategory || selectedTag || showExpired) {
      setShowAllDocuments(true); // Show all when filtering
    }
    // Clear selections for documents that are no longer in the filtered list
    setSelectedDocuments((prev) => {
      const filteredIds = new Set(filtered.map((doc) => doc.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (filteredIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [documents, searchQuery, selectedCategory, selectedTag, showExpired]);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setUploadSuccess(data.message);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          // Refetch documents after a short delay to ensure DB is updated
          setTimeout(() => {
            fetchDocuments();
          }, 300);
        } else {
          setUploadError(data.error || "Failed to upload documents");
        }
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload documents"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [fetchDocuments]
  );

  const handleAnalyze = useCallback(async (docId: string) => {
    setAnalyzingDoc(docId);
    try {
      const response = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });

      const data = await response.json();
      if (response.ok) {
        setUploadSuccess("Document analyzed successfully! Category, tags, and summary have been generated.");
        fetchDocuments();
      } else {
        setUploadError(data.error || "Failed to analyze document");
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to analyze document"
      );
    } finally {
      setAnalyzingDoc(null);
    }
  }, [fetchDocuments]);

  const handleUpdate = useCallback(async () => {
    if (!editingDoc) return;

    try {
      const response = await fetch("/api/documents/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: editingDoc.id,
          ...editForm,
          expiration_date: editForm.expiration_date || null,
        }),
      });

      if (response.ok) {
        setEditingDoc(null);
        setEditForm({ category: "", tags: [], expiration_date: "", description: "" });
        setUploadSuccess("Document updated successfully!");
        fetchDocuments();
      } else {
        const data = await response.json();
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || "Failed to update document";
        setUploadError(errorMessage);
        console.error("Update error:", data);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to update document"
      );
    }
  }, [editingDoc, editForm, fetchDocuments]);

  const handleDelete = useCallback(
    async (documentId: string, filename: string) => {
      if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
        return;
      }

      try {
        const response = await fetch(`/api/documents?id=${documentId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchDocuments();
          setSelectedDocuments((prev) => {
            const next = new Set(prev);
            next.delete(documentId);
            return next;
          });
        } else {
          const data = await response.json();
          alert(data.error || "Failed to delete document");
        }
      } catch (error) {
        alert("Failed to delete document");
        console.error("Error deleting document:", error);
      }
    },
    [fetchDocuments]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedDocuments.size === 0) return;

    const count = selectedDocuments.size;
    const filenames = filteredDocuments
      .filter((doc) => selectedDocuments.has(doc.id))
      .map((doc) => doc.filename)
      .slice(0, 3)
      .join(", ");
    const moreText = count > 3 ? ` and ${count - 3} more` : "";

    if (
      !confirm(
        `Are you sure you want to delete ${count} document${count > 1 ? "s" : ""}?${filenames ? `\n\n${filenames}${moreText}` : ""}`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedDocuments).map((id) =>
        fetch(`/api/documents?id=${id}`, {
          method: "DELETE",
        }).then((res) => ({ id, ok: res.ok, response: res }))
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.ok);

      if (failed.length > 0) {
        alert(`Failed to delete ${failed.length} document(s)`);
      } else {
        setUploadSuccess(`Successfully deleted ${count} document${count > 1 ? "s" : ""}!`);
      }

      setSelectedDocuments(new Set());
      fetchDocuments();
    } catch (error) {
      alert("Failed to delete documents");
      console.error("Error deleting documents:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedDocuments, filteredDocuments, fetchDocuments]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredDocuments.map((doc) => doc.id));
      setSelectedDocuments(allIds);
    } else {
      setSelectedDocuments(new Set());
    }
  }, [filteredDocuments]);

  const handleToggleSelect = useCallback((documentId: string) => {
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) {
        next.delete(documentId);
      } else {
        next.add(documentId);
      }
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType === "application/pdf") return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    return "📎";
  };

  const isExpired = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const isExpiringSoon = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return false;
    const daysUntilExpiration =
      (new Date(expirationDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24);
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
  };

  // Compute tags from documents - memoize to prevent hydration issues
  const allTags = useMemo(
    () => Array.from(new Set(documents.flatMap((doc) => doc.tags || []))).filter(Boolean),
    [documents]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-dashed bg-white/80 shadow-sm transition-colors dark:bg-slate-900/70",
          isDragOver
            ? "border-emerald-400 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-500/10"
            : "border-emerald-200 dark:border-emerald-900/60"
        )}
      >
        <label
          htmlFor="doc-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-transparent p-8 text-center text-sm text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:text-emerald-200"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors dark:bg-emerald-500/20 dark:text-emerald-200">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {isUploading
              ? "Uploading..."
              : "Drag and drop files or click to browse"}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Accepted: PDF, DOCX, XLSX, PNG, JPG · Max 10MB per file
          </span>
          <input
            ref={fileInputRef}
            id="doc-upload"
            name="documents"
            type="file"
            multiple
            disabled={isUploading}
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </label>
      </Card>

      {/* Messages */}
      {(uploadError || uploadSuccess) && (
        <Card
          className={cn(
            "border shadow-sm",
            uploadError
              ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-500/10"
              : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-500/10"
          )}
        >
          <CardContent className="flex items-center justify-between p-4">
            <p
              className={cn(
                "text-sm font-medium",
                uploadError
                  ? "text-red-700 dark:text-red-200"
                  : "text-emerald-700 dark:text-emerald-200"
              )}
            >
              {uploadError || uploadSuccess}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setUploadError(null);
                setUploadSuccess(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCategory || undefined} onValueChange={(value) => setSelectedCategory(value || "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag || undefined} onValueChange={(value) => setSelectedTag(value || "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showExpired ? "default" : "outline"}
              size="sm"
              onClick={() => setShowExpired(!showExpired)}
              className="gap-2"
              suppressHydrationWarning
            >
              <AlertTriangle className="h-4 w-4" />
              Expired
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedTag("");
                setShowExpired(false);
                setShowAllDocuments(false); // Reset to showing 5
              }}
              suppressHydrationWarning
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Your uploads
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                {filteredDocuments.length === 0
                  ? "No files yet. Upload key documents to keep them handy for permits, loans, and audits."
                  : `${filteredDocuments.length} file${filteredDocuments.length === 1 ? "" : "s"} ${searchQuery || selectedCategory || selectedTag || showExpired ? "found" : "uploaded"}`}
              </CardDescription>
            </div>
            {filteredDocuments.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Select all
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Toolbar */}
          {selectedDocuments.size > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-500/10">
              <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                {selectedDocuments.size} document{selectedDocuments.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocuments(new Set())}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
          {filteredDocuments.length === 0 ? (
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500/80" />
                <span>Keep compliance records available for surprise inspections.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500/80" />
                <span>Upload scans with clear titles so your team can find them fast.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500/80" />
                <span>Remember to update files after renewing licenses or policies.</span>
              </li>
            </ul>
          ) : (
            <div className="space-y-3">
              {(() => {
                const hasActiveFilters = searchQuery || selectedCategory || selectedTag || showExpired;
                const shouldLimit = !hasActiveFilters && filteredDocuments.length > 5 && !showAllDocuments;
                return shouldLimit ? filteredDocuments.slice(0, 5) : filteredDocuments;
              })().map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border bg-white/80 p-4 transition-colors dark:bg-slate-900/80",
                    isExpired(doc.expiration_date)
                      ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-500/10"
                      : isExpiringSoon(doc.expiration_date)
                      ? "border-yellow-300 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-500/10"
                      : selectedDocuments.has(doc.id)
                      ? "border-emerald-500 bg-emerald-50/60 dark:border-emerald-600 dark:bg-emerald-500/20"
                      : "border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-emerald-900 dark:hover:border-emerald-700"
                  )}
                >
                  <Checkbox
                    checked={selectedDocuments.has(doc.id)}
                    onCheckedChange={() => handleToggleSelect(doc.id)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg dark:bg-emerald-500/20">
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {doc.filename}
                      </p>
                      {doc.shared_with && doc.shared_with.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Shared
                        </Badge>
                      )}
                      {isExpired(doc.expiration_date) && (
                        <Badge className="bg-red-600 text-white">
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon(doc.expiration_date) && (
                        <Badge className="bg-yellow-600 text-white">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {formatFileSize(doc.file_size)} · {formatDate(doc.uploaded_at)}
                      </span>
                      {doc.category && (
                        <Badge variant="outline" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                      {doc.tags && doc.tags.length > 0 && (
                        <>
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>
                    {doc.description && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {doc.description}
                      </p>
                    )}
                    {doc.summary && (
                      <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50/50 p-2 dark:border-emerald-900 dark:bg-emerald-500/10">
                        <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100">
                          AI Summary:
                        </p>
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                          {doc.summary}
                        </p>
                      </div>
                    )}
                    {doc.expiration_date && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Expires: {formatDate(doc.expiration_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                      onClick={async () => {
                        if (doc.downloadUrl) {
                          setPreviewDoc(doc);
                        } else {
                          // Fetch documents to get download URLs
                          const docs = await fetchDocuments();
                          // Find the updated doc from the fetched results
                          const updatedDoc = docs.find((d) => d.id === doc.id);
                          if (updatedDoc?.downloadUrl) {
                            setPreviewDoc({ ...doc, downloadUrl: updatedDoc.downloadUrl });
                          } else {
                            // Still show preview even without URL (for PDFs)
                            setPreviewDoc(doc);
                          }
                        }
                      }}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                      onClick={async () => {
                        if (doc.downloadUrl) {
                          window.open(doc.downloadUrl, "_blank");
                        } else {
                          // Fetch documents to get download URLs
                          const docs = await fetchDocuments();
                          // Find the updated doc from the fetched results
                          const updatedDoc = docs.find((d) => d.id === doc.id);
                          if (updatedDoc?.downloadUrl) {
                            window.open(updatedDoc.downloadUrl, "_blank");
                          }
                        }
                      }}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                      onClick={() => {
                        setEditingDoc(doc);
                        setEditForm({
                          category: doc.category || "",
                          tags: doc.tags || [],
                          expiration_date: doc.expiration_date
                            ? new Date(doc.expiration_date).toISOString().split("T")[0]
                            : "",
                          description: doc.description || "",
                        });
                      }}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                      onClick={() => handleAnalyze(doc.id)}
                      disabled={analyzingDoc === doc.id}
                      title="Analyze with AI"
                    >
                      {analyzingDoc === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/20"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {/* View More/Less Button */}
              {filteredDocuments.length > 5 && !searchQuery && !selectedCategory && !selectedTag && !showExpired && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllDocuments(!showAllDocuments)}
                    className="gap-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                  >
                    {showAllDocuments ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View More ({filteredDocuments.length - 5} more)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreview
          document={previewDoc}
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <Card className="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-y-1/2 overflow-auto border-emerald-200 bg-white shadow-lg dark:border-emerald-900 dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100 dark:border-emerald-900">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Edit Document
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setEditingDoc(null);
                setEditForm({ category: "", tags: [], expiration_date: "", description: "" });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <Select
                value={editForm.category || undefined}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, category: value || "" })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Expiration Date
              </label>
              <Input
                type="date"
                value={editForm.expiration_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, expiration_date: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <Input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Add a description..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingDoc(null);
                  setEditForm({ category: "", tags: [], expiration_date: "", description: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
