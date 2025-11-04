"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string | null;
}

export function ProfilePhotoUpload({
  currentAvatarUrl,
}: ProfilePhotoUploadProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentAvatarUrl) return;

    setIsRemoving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile/remove-photo", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove photo");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id="photo-upload"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full border-emerald-200 px-4 text-xs font-semibold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/40"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRemoving}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Uploading...
            </>
          ) : success ? (
            <>
              <Check className="mr-2 h-3 w-3" />
              Done!
            </>
          ) : (
            <>
              <Upload className="mr-2 h-3 w-3" />
              {currentAvatarUrl ? "Change photo" : "Upload photo"}
            </>
          )}
        </Button>
        {currentAvatarUrl && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-red-200 px-4 text-xs font-semibold text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-200 dark:hover:border-red-700 dark:hover:bg-red-900/40"
            onClick={handleRemovePhoto}
            disabled={isUploading || isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <X className="mr-2 h-3 w-3" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

