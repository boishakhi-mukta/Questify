/**
 * ============================================================================
 * QUESTIFY COMPONENT: Button (UI Base)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A standardized clickable button supporting colors and loading indicators.
 * 
 * WHY IT EXISTS:
 * Unifies action-button styles across the application.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps primitive HTML buttons, extending variants like primary, secondary, and outline.
 * ============================================================================
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-blue text-white hover:bg-brand-blue-dark",
        outline:
          "border border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue hover:text-white",
        ghost: "text-brand-body hover:bg-brand-bg hover:text-brand-dark",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        secondary: "bg-brand-bg text-brand-body border border-brand-border hover:border-brand-blue hover:text-brand-dark",
        sidebar:
          "w-full justify-start gap-2.5 rounded-md text-white/55 font-medium hover:bg-white/8 hover:text-white",
        "sidebar-active":
          "w-full justify-start gap-2.5 rounded-md text-white font-bold",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1.5 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
