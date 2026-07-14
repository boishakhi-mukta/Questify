"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: XPProgressBar
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Displays a colorful progress bar showing how many Experience Points (XP) a
 * student has earned compared to the total points needed for the next level.
 * 
 * WHY IT EXISTS:
 * To give students a visual sense of achievement and let them see at a glance
 * how close they are to reaching their next academic goal/level.
 * 
 * HOW IT WORKS (Technical Overview):
 * Takes 'current' and 'total' numbers, calculates the percentage, and uses
 * HeroUI's ProgressBar elements to animate the fill of the track.
 * ============================================================================
 */

import {
  Card,
  CardContent,
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";

type XPColor = "success" | "accent" | "warning" | "danger" | "default";
type XPSize  = "sm" | "md" | "lg";

interface XPProgressBarProps {
  current:   number;
  total:     number;
  label?:    string;
  color?:    XPColor;
  size?:     XPSize;
  showCard?: boolean;
  animated?: boolean;
}

export function XPProgressBar({
  current,
  total,
  label    = "XP Progress",
  color    = "success",
  size     = "md",
  showCard = true,
  animated = true,
}: XPProgressBarProps) {
  const pct     = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const rounded = Math.round(pct);

  const bar = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-brand-body dark:text-white/70">
          {label}
        </span>
        <span className="text-[13px] font-bold text-brand-dark dark:text-white">
          {rounded}%
        </span>
      </div>

      <ProgressBarRoot
        value={pct}
        minValue={0}
        maxValue={100}
        aria-label={label}
        color={color}
        size={size}
      >
        <ProgressBarTrack>
          <ProgressBarFill
            className={animated ? "transition-all duration-700 ease-out" : undefined}
          />
        </ProgressBarTrack>
      </ProgressBarRoot>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-brand-body/55 dark:text-white/35">
          {current.toLocaleString()} XP earned
        </span>
        <span className="text-[11px] text-brand-body/55 dark:text-white/35">
          {total.toLocaleString()} XP total
        </span>
      </div>
    </div>
  );

  if (!showCard) return bar;

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        {bar}
      </CardContent>
    </Card>
  );
}
