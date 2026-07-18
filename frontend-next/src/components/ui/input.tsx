/**
 * ============================================================================
 * QUESTIFY COMPONENT: Input (UI Base)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A standardized text input field.
 * 
 * WHY IT EXISTS:
 * Ensures text fields look uniform across forms.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps basic inputs, passing styles like borders, focus-outlines, and disabled status.
 * ============================================================================
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// A single-line text box (used for things like email, name, or search
// fields) with the app's standard look — border, spacing, focus highlight.
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-brand-border bg-white dark:bg-[#162B21] px-3.5 py-2 text-sm text-brand-dark dark:text-[#D8F0E8] placeholder:text-brand-body/50 transition-colors focus:outline-none focus:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
