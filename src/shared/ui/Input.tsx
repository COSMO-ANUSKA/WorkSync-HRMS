import React from "react";
import { cn } from "@/shared/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface text-text-main placeholder-text-muted transition-all outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent",
              icon && "pl-10",
              error && "border-accent-rose focus:ring-accent-rose focus:border-accent-rose",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="block text-xs font-medium text-accent-rose mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
