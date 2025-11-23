"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefaultAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      if (email) {
        return email[0].toUpperCase();
      }
      return "";
    }
    const parts = trimmedName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      // Get first letter of first name and first letter of last name
      const firstInitial = parts[0][0]?.toUpperCase() || "";
      const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || "";
      return (firstInitial + lastInitial).slice(0, 2);
    }
    // Single name - take first 2 letters
    return trimmedName.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-24 w-24 text-3xl",
  xl: "h-32 w-32 text-4xl",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function DefaultAvatar({
  name,
  email,
  size = "lg",
  className,
}: DefaultAvatarProps) {
  const initials = getInitials(name, email);
  const hasInitials = initials.length > 0;

  return (
    <div
      className={cn(
        "flex flex-shrink-0 select-none items-center justify-center overflow-hidden rounded-full border-4 border-[#EDD9D4]/80 bg-gradient-to-br from-[#7D3227] via-[#531324] to-[#3E1421] text-white font-bold shadow-md ring-2 ring-[#EDD9D4]/40 dark:border-slate-900",
        sizeClasses[size],
        className,
      )}
      aria-label={hasInitials ? `Avatar with initials ${initials}` : "Default user avatar"}
      style={{
        minWidth: sizeClasses[size].split(" ")[0],
        minHeight: sizeClasses[size].split(" ")[0],
        maxWidth: sizeClasses[size].split(" ")[0],
        maxHeight: sizeClasses[size].split(" ")[0],
      }}
    >
      {hasInitials ? (
        <span 
          className="font-bold text-white leading-none text-center select-none pointer-events-none whitespace-nowrap"
          style={{ fontSize: size === "lg" ? "1.5rem" : size === "xl" ? "2rem" : "inherit" }}
        >
          {initials}
        </span>
      ) : (
        <User
          className={cn(
            "flex-shrink-0 text-[#EDD9D4]",
            iconSizeClasses[size],
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
