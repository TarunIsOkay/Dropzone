import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-dz-text-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-dz-elevated border rounded-lg px-4 py-2.5 text-sm text-dz-text",
            "placeholder:text-dz-text-dim",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dz-bg",
            "transition-colors duration-200",
            error
              ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
              : "border-dz-border focus:ring-dz-crimson/50 focus:border-dz-crimson",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-dz-text-dim">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
