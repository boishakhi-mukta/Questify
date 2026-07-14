"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: PageTransition
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Animates the screen smoothly when navigating from one link/page to another.
 * 
 * WHY IT EXISTS:
 * Eliminates harsh page flashes, maintaining visual continuity during navigation.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses Framer Motion's AnimatePresence to animate entry and exit states during route changes.
 * ============================================================================
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
