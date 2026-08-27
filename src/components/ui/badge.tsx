import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "crimson" | "cyan" | "green" | "amber" | "default";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot,
  className,
}: BadgeProps) {
  const variants = {
    crimson: "bg-dz-crimson/10 text-dz-crimson-400 border-dz-crimson/20",
    cyan: "bg-dz-cyan/10 text-dz-cyan-400 border-dz-cyan/20",
    green: "bg-dz-green/10 text-dz-green-400 border-dz-green/20",
    amber: "bg-dz-amber/10 text-dz-amber-400 border-dz-amber/20",
    default: "bg-dz-elevated text-dz-text-muted border-dz-border",
  };

  const dotColors = {
    crimson: "bg-dz-crimson-400",
    cyan: "bg-dz-cyan-400",
    green: "bg-dz-green-400",
    amber: "bg-dz-amber-400",
    default: "bg-dz-text-dim",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
