/**
 * ============================================================================
 * QUESTIFY LIBRARY: Motion Curves Presets
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Defines visual speeds and curves used by components during animations.
 * 
 * WHY IT EXISTS:
 * Guarantees animations remain uniform, preserving aesthetics.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports transition settings utilized by Framer Motion divs.
 * ============================================================================
 */

import type { Variants, Transition } from "framer-motion";

// ── Reusable Framer Motion variants ───────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0  },
};

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0   },
};

export const fadeInLeft: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0  },
};

export const fadeInRight: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0   },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1    },
};

// ── Stagger container variants ─────────────────────────────────────────────────

export function staggerContainer(
  staggerChildren = 0.1,
  delayChildren   = 0.15,
): Variants {
  return {
    hidden:  { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren, delayChildren },
    },
  };
}

// ── Shared transitions ─────────────────────────────────────────────────────────

export const easeOut: Transition  = { duration: 0.55, ease: [0.16, 1, 0.3, 1] };
export const easeSnappy: Transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };
export const spring: Transition   = { type: "spring", stiffness: 300, damping: 28 };

// ── Hover / tap presets (spread onto motion elements) ─────────────────────────

export const hoverLift = {
  whileHover: { y: -6, boxShadow: "0 16px 32px -8px rgba(0,0,0,0.18)" },
  transition:  { duration: 0.25, ease: "easeOut" },
} as const;

export const hoverScale = {
  whileHover: { scale: 1.04 },
  whileTap:   { scale: 0.97 },
  transition:  { duration: 0.2 },
} as const;
