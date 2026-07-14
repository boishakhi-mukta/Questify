"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: ScrollReveal
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Causes parts of the webpage to smoothly slide or fade in as you scroll down.
 * 
 * WHY IT EXISTS:
 * Enhances aesthetics, making the platform feel high-end, responsive, and alive.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses Framer Motion's intersection observer hooks to detect when elements enter the screen.
 * ============================================================================
 */

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import type { Variants } from "framer-motion";
import { easeOut } from "@/lib/animation-presets";

type Direction = "up" | "down" | "left" | "right" | "none";

const directionVariants: Record<Direction, Variants> = {
  up:    { hidden: { opacity: 0, y: 36  }, visible: { opacity: 1, y: 0  } },
  down:  { hidden: { opacity: 0, y: -36 }, visible: { opacity: 1, y: 0  } },
  left:  { hidden: { opacity: 0, x: 48  }, visible: { opacity: 1, x: 0  } },
  right: { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0  } },
  none:  { hidden: { opacity: 0         }, visible: { opacity: 1         } },
};

interface ScrollRevealProps {
  children:   ReactNode;
  direction?: Direction;
  delay?:     number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay     = 0,
  className,
}: ScrollRevealProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-60px 0px" });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={directionVariants[direction]}
      initial={reduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      transition={{ ...easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}
