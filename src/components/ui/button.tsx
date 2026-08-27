import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "cyan";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-dz-crimson text-white hover:bg-dz-crimson-600 active:bg-dz-crimson-700 shadow-glow hover:shadow-glow-lg",
      secondary:
        "bg-dz-elevated text-dz-text border border-dz-border hover:bg-dz-border/50 hover:border-dz-border-light",
      ghost: "text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated",
      danger: "bg-red-600 text-white hover:bg-red-700",
      cyan: "bg-dz-cyan/10 text-dz-cyan-400 border border-dz-cyan/20 hover:bg-dz-cyan/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dz-bg",
          variants[variant],
          sizes[size],
          variant === "primary" && "focus:ring-dz-crimson/50",
          variant === "secondary" && "focus:ring-dz-border-light/50",
          variant === "danger" && "focus:ring-red-500/50",
          variant === "cyan" && "focus:ring-dz-cyan/50",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
