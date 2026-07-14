"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: AnimatedCard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A card container that tilts or elevates slightly when you hover your mouse pointer over it.
 * 
 * WHY IT EXISTS:
 * Adds pleasant interactivity and immediate feedback to user mouse movements.
 * 
 * HOW IT WORKS (Technical Overview):
 * Leverages Framer Motion hover scale and transition props on a customized div container.
 * ============================================================================
 */

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children:   ReactNode;
  className?: string;
  onClick?:   () => void;
  as?:        "div" | "li" | "article";
}

export function AnimatedCard({
  children,
  className,
  onClick,
  as = "div",
}: AnimatedCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      className={cn(onClick && "cursor-pointer", className)}
      whileHover={reduced ? {} : { y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
      whileTap={reduced   ? {} : { scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
