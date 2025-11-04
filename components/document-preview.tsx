"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  document: {
    id: string;
    filename: string;
    file_type: string;
    downloadUrl: string | null;
    description?: string | null;
    category?: string | null;
    tags?: string[] | null;
    expiration_date?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreview({
  document,
  isOpen,
  onClose,
}: DocumentPreviewProps) {
  if (!isOpen) return null;

  const isImage =
    document.file_type.startsWith("image/") ||
    document.file_type === "application/pdf";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        !isOpen && "hidden"
      )}
      onClick={onClose}
    >
      <Card
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden border-emerald-200 bg-white shadow-lg dark:border-emerald-900 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100 dark:border-emerald-900">
          <CardTitle className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
            {document.filename}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {document.downloadUrl && isImage ? (
            <div className="flex max-h-[80vh] items-center justify-center overflow-auto bg-slate-100 dark:bg-slate-800">
              {document.file_type === "application/pdf" ? (
                <iframe
                  src={document.downloadUrl}
                  className="h-[80vh] w-full"
                  title={document.filename}
                />
              ) : (
                <img
                  src={document.downloadUrl}
                  alt={document.filename}
                  className="max-h-[80vh] max-w-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Preview not available for this file type
              </p>
            </div>
          )}
          {document.description && (
            <div className="border-t border-emerald-100 p-4 dark:border-emerald-900">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {document.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

