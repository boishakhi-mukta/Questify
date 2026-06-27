"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerContainer, fadeInUp, easeOut } from "@/lib/animation-presets";

interface StaggerContainerProps {
  children:        ReactNode;
  className?:      string;
  staggerChildren?: number;
  delayChildren?:  number;
}

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
