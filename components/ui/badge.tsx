import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-500/20 text-brand-200 border border-brand-500/30",
        success: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
        warning: "bg-orange-500/20 text-orange-200 border border-orange-500/30",
        danger: "bg-rose-500/20 text-rose-200 border border-rose-500/30",
        neutral: "bg-white/10 text-slate-200 border border-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
