"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: BadgeGrid
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Displays a catalog or grid of academic achievements (badges), highlighting the
 * ones the student has unlocked and showing locked ones in greyscale.
 * 
 * WHY IT EXISTS:
 * To gamify the curriculum, encouraging students to participate and complete
 * tasks to collect special awards.
 * 
 * HOW IT WORKS (Technical Overview):
 * Renders a grid layout that maps over a list of system badges, comparing them
 * against the student's earned badges list to toggle color/greyscale status.
 * ============================================================================
 */

import React from "react";
import { Chip, Tooltip, TooltipTrigger, TooltipContent } from "@heroui/react";
import {
  type Badge,
  RARITY_CHIP_COLOR,
  RARITY_LABEL,
  RARITY_BORDER,
  RARITY_BG,
  RARITY_TEXT,
} from "@/lib/badges";
import { cn } from "@/lib/utils";

interface BadgeGridProps {
  badges: Badge[];
  earnedBadges: string[];
  className?: string;
}

// One badge tile — full color if earned, greyed-out if not, with a tooltip
// explaining how to earn it (or confirming it's earned).
function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={cn(
            "relative flex flex-col items-center gap-2 p-3 rounded-xl border cursor-default transition-all select-none",
            earned
              ? [RARITY_BORDER[badge.rarity], RARITY_BG[badge.rarity]]
              : "border-brand-border dark:border-white/8 bg-brand-surface dark:bg-slate-900/30 opacity-40 grayscale"
          )}
        >
          {/* Rarity shimmer for legendary */}
          {earned && badge.rarity === "legendary" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-200/20 via-transparent to-yellow-400/10 dark:from-yellow-400/10 pointer-events-none" />
          )}

          <span className="text-2xl leading-none">{badge.icon}</span>

          <span className="text-[10px] font-medium text-brand-dark dark:text-white text-center leading-tight line-clamp-2">
            {badge.name}
          </span>

          {earned && (
            <span
              className={cn(
                "text-[9px] font-semibold uppercase tracking-wider",
                RARITY_TEXT[badge.rarity]
              )}
            >
              {RARITY_LABEL[badge.rarity]}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-[200px] space-y-1">
          <p className="font-semibold text-[14px]">{badge.name}</p>
          <p className="text-[13px] text-white/70">{badge.description}</p>
          <p className="text-[12px] text-white/50">
            {earned ? "✓ Earned" : `🔒 ${badge.condition}`}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Shows every badge in the system as a grid, with a summary count of how
// many the student has earned overall and by rarity tier.
export function BadgeGrid({ badges, earnedBadges, className }: BadgeGridProps) {
  const earnedSet = new Set(earnedBadges);
  const earnedCount = badges.filter((b) => earnedSet.has(b.id)).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress summary */}
      <div className="flex items-center justify-between">
        <p className="text-[15px] text-brand-muted dark:text-white/60">
          {earnedCount} of {badges.length} badges earned
        </p>
        <div className="flex items-center gap-2">
          {(["common", "rare", "epic", "legendary"] as const).map((r) => {
            const count = badges.filter(
              (b) => b.rarity === r && earnedSet.has(b.id)
            ).length;
            const total = badges.filter((b) => b.rarity === r).length;
            if (total === 0) return null;
            return (
              <Chip
                key={r}
                color={RARITY_CHIP_COLOR[r]}
                variant="soft"
                size="sm"
                className="text-[10px]"
              >
                {count}/{total}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} earned={earnedSet.has(badge.id)} />
        ))}
      </div>
    </div>
  );
}
