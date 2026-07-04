import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border",
  {
    variants: {
      variant: {
        success: "bg-emerald-50 text-accent-emerald border-emerald-200 dark:bg-emerald-950/20",
        warning: "bg-amber-50 text-accent-amber border-amber-200 dark:bg-amber-950/20",
        danger: "bg-rose-50 text-accent-rose border-rose-200 dark:bg-rose-950/20",
        info: "bg-blue-50 text-accent-blue border-blue-200 dark:bg-blue-950/20",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
