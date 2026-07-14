/**
 * ============================================================================
 * QUESTIFY COMPONENT: Label (UI Base)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A text label that sits next to form inputs describing what they ask for.
 * 
 * WHY IT EXISTS:
 * Crucial tool for form accessibility.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps primitive HTML labels styled using Tailwind classes.
 * ============================================================================
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-[13px] font-semibold text-brand-dark leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
