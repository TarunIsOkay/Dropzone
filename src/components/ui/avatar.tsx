"use client";

import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "in-match";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const statusSizeMap = {
  sm: "w-2.5 h-2.5 border",
  md: "w-3 h-3 border-2",
  lg: "w-3.5 h-3.5 border-2",
  xl: "w-4 h-4 border-2",
};

const statusColorMap = {
  online: "bg-dz-green",
  offline: "bg-dz-text-dim",
  "in-match": "bg-dz-crimson animate-pulse",
};

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  className,
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={cn(
            "rounded-full object-cover",
            sizeMap[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-dz-elevated border border-dz-border flex items-center justify-center font-semibold text-dz-text-muted",
            sizeMap[size]
          )}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-dz-bg",
            statusSizeMap[size],
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
}
