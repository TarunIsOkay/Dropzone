import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-dz-elevated border rounded-lg px-4 py-2.5 text-sm text-dz-text",
              "appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dz-bg",
              "transition-colors duration-200",
              error
                ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                : "border-dz-border focus:ring-dz-crimson/50 focus:border-dz-crimson",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-dz-text-dim">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-text-dim pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
