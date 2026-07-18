"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: StaggerContainer
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Coordinates list items so they fade in one after the other in rapid succession.
 * 
 * WHY IT EXISTS:
 * Avoids abrupt pops of layout lists, creating a smooth visual load sequence.
 * 
 * HOW IT WORKS (Technical Overview):
 * Utilizes motion container parent-child stagger transitions (staggerChildren).
 * ============================================================================
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerContainer, fadeInUp, easeOut } from "@/lib/animation-presets";

interface StaggerContainerProps {
  children:        ReactNode;
  className?:      string;
  staggerChildren?: number;
  delayChildren?:  number;
}

// Wraps a group of items (like a grid of cards) so they animate in one
// after another instead of all at once. Pair each child with StaggerItem below.
export function StaggerContainer({
  children,
  className,
  staggerChildren = 0.1,
  delayChildren   = 0.1,
}: StaggerContainerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px 0px" }}
      variants={staggerContainer(staggerChildren, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

// One item inside a StaggerContainer — fades/slides up into place when its
// turn in the sequence comes up.
export function StaggerItem({
  children,
  className,
}: {
  children:  ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduced ? {} : fadeInUp}
      transition={easeOut}
    >
      {children}
    </motion.div>
  );
}
