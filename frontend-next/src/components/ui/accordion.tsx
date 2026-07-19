"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Accordion (UI Base)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A stack of headers that expand when clicked to reveal content.
 * 
 * WHY IT EXISTS:
 * Condenses long documents (FAQs, syllabi) into readable formats.
 * 
 * HOW IT WORKS (Technical Overview):
 * Manages item visibility states with toggle event controls.
 * ============================================================================
 */

import * as React from "react";
import {
  AccordionRoot,
  AccordionItem as HeroAccordionItem,
  AccordionTrigger as HeroAccordionTrigger,
  AccordionHeading,
  AccordionPanel,
} from "@heroui/react";
import { HiChevronDown } from "react-icons/hi2";
import { cn } from "@/lib/utils";

// The outer wrapper that holds a whole group of expandable sections.
export function Accordion({
  children,
  className,
  type: _type,
  collapsible: _collapsible,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type?: string;
  collapsible?: boolean;
}) {
  return (
    <AccordionRoot className={cn("flex flex-col", className)} {...(props as object)}>
      {children}
    </AccordionRoot>
  );
}

// One single expandable section (one question + its answer, one module +
// its details, etc.) inside the Accordion.
export function AccordionItem({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <HeroAccordionItem
      id={value}
      className={cn("border border-brand-border rounded-xl overflow-hidden", className)}
      {...(props as object)}
    >
      {children}
    </HeroAccordionItem>
  );
}

// The clickable header row — clicking it opens or closes that section, and
// the little arrow icon flips to show which state it's in.
export function AccordionTrigger({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <AccordionHeading className="flex">
      <HeroAccordionTrigger
        className={cn(
          "flex flex-1 items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-brand-dark bg-white transition-colors hover:bg-brand-bg data-[expanded=true]:bg-brand-bg",
          className
        )}
        {...(props as object)}
      >
        {children}
        <HiChevronDown
          size={16}
          className="text-brand-body shrink-0 transition-transform duration-200 group-data-[expanded=true]:rotate-180"
        />
      </HeroAccordionTrigger>
    </AccordionHeading>
  );
}

// The hidden text/content that appears once a section is expanded.
export function AccordionContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <AccordionPanel {...(props as object)}>
      <div
        className={cn(
          "px-4 py-3 text-[14px] text-brand-body leading-relaxed border-t border-brand-border",
          className
        )}
      >
        {children}
      </div>
    </AccordionPanel>
  );
}
