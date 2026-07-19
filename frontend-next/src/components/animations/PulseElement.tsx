"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: PulseElement
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Adds a gentle, repetitive pulsing effect to any button or icon to grab interest.
 * 
 * WHY IT EXISTS:
 * To highlight key components without being overly distracting to the user.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps child elements in a Framer Motion div configured with looping scale transitions.
 * ============================================================================
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface PulseElementProps {
  children:  ReactNode;
  className?: string;
}

// Wraps something (like an icon or button) in a slow, gentle pulsing effect
// to softly draw the eye to it. Skips the animation for users who've asked
// their device to reduce motion.
export function PulseElement({ children, className }: PulseElementProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.06, 1], opacity: [1, 0.82, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
