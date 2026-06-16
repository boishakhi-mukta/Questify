import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-bg text-brand-body px-2.5 py-0.5",
        blue: "bg-brand-blue-light text-brand-blue px-2.5 py-0.5 font-bold",
        outline:
          "border border-white/30 bg-white/15 text-white px-3 py-0.5",
        admin: "bg-violet-500/15 text-violet-400 uppercase tracking-widest text-[11px] px-2 py-0.5",
        teacher: "bg-emerald-500/15 text-emerald-400 uppercase tracking-widest text-[11px] px-2 py-0.5",
        student: "bg-brand-blue/15 text-brand-blue uppercase tracking-widest text-[11px] px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
