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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#30d99a_0%,#25B585_55%,#1da870_100%)] text-white shadow-[0_4px_18px_rgba(37,181,133,0.45)] hover:shadow-[0_6px_26px_rgba(37,181,133,0.65)] hover:brightness-105",
        outline:
          "border border-brand-blue text-brand-blue bg-transparent hover:bg-[linear-gradient(135deg,#25B585_0%,#1da870_100%)] hover:text-white hover:border-transparent hover:shadow-[0_4px_18px_rgba(37,181,133,0.45)]",
        ghost:
          "text-brand-body hover:bg-brand-bg hover:text-brand-dark",
        destructive:
          "bg-[linear-gradient(135deg,#f87171_0%,#dc2626_100%)] text-white shadow-[0_4px_16px_rgba(220,38,38,0.35)] hover:shadow-[0_6px_22px_rgba(220,38,38,0.55)] hover:brightness-105",
        secondary:
          "bg-brand-bg text-brand-body border border-brand-border hover:border-brand-blue hover:text-brand-dark",
        sidebar:
          "w-full justify-start gap-2.5 rounded-xl text-white/55 font-medium hover:bg-white/8 hover:text-white",
        "sidebar-active":
          "w-full justify-start gap-2.5 rounded-xl text-white font-bold",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm:      "h-8 px-4 py-1.5 text-xs",
        lg:      "h-12 px-8 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// The app's standard clickable button, in different colors (variant) and
// sizes. When `asChild` is set, it styles whatever element is passed in
// (e.g. a Link) instead of rendering its own <button> tag.
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
