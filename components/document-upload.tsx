"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { UploadCloud, Download, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  downloadUrl: string | null;
}

interface DocumentUploadProps {
  initialDocuments?: Document[];
}

export function DocumentUpload({ initialDocuments = [] }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, []);

  // Sync initial documents when they change
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

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
          await fetchDocuments();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
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
          await fetchDocuments();
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
    if (fileType.startsWith("image/")) {
      return "🖼️";
    }
    if (fileType === "application/pdf") {
      return "📄";
    }
    if (
      fileType.includes("word") ||
      fileType.includes("document")
    ) {
      return "📝";
    }
    if (fileType.includes("sheet") || fileType.includes("excel")) {
      return "📊";
    }
    return "📎";
  };

  return (
    <div className="flex flex-col gap-6">
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

      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Your uploads
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            {documents.length === 0
              ? "No files yet. Upload key documents to keep them handy for permits, loans, and audits."
              : `${documents.length} file${documents.length === 1 ? "" : "s"} uploaded`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
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
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-emerald-100 bg-white/80 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-emerald-900 dark:bg-slate-900/80 dark:hover:border-emerald-700"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg dark:bg-emerald-500/20">
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(doc.file_size)} · Uploaded {formatDate(doc.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                        onClick={() => window.open(doc.downloadUrl!, "_blank")}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

