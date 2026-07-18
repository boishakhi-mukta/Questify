"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: BadgeEarnedModal
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A pop-up celebration window that displays when a student successfully unlocks
 * a new badge (like "Attendance Champion" or "A+ Submitter").
 * 
 * WHY IT EXISTS:
 * To provide instant feedback and validate student hard work with a pleasant
 * visual reward.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses Framer Motion for entering/leaving animations and overlays a backdrop over
 * the page, showcasing the badge image, title, and unlock description.
 * ============================================================================
 */

import React from "react";
import {
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
  Chip,
  useOverlayState,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import {
  type Badge,
  RARITY_CHIP_COLOR,
  RARITY_LABEL,
  RARITY_TEXT,
  RARITY_BORDER,
} from "@/lib/badges";
import { cn } from "@/lib/utils";

interface BadgeEarnedModalProps {
  badge: Badge | null;
  state: ReturnType<typeof useOverlayState>;
}

// The celebration popup shown when a student unlocks a new achievement
// badge — shows the badge icon, name, rarity, and description.
export function BadgeEarnedModal({ badge, state }: BadgeEarnedModalProps) {
  if (!badge) return null;

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="sm" placement="center">
        <ModalDialog>
          {/* Header — large icon */}
          <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
            <div
              className={cn(
                "w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-5xl",
                RARITY_BORDER[badge.rarity]
              )}
            >
              {badge.icon}
            </div>
            <div className="text-center space-y-1">
              <ModalHeading className="text-xl font-bold text-brand-dark dark:text-white">
                {badge.name}
              </ModalHeading>
              <Chip
                color={RARITY_CHIP_COLOR[badge.rarity]}
                variant="soft"
                size="sm"
              >
                {RARITY_LABEL[badge.rarity]}
              </Chip>
            </div>
            <ModalCloseTrigger />
          </ModalHeader>

          {/* Body — description + confetti hint */}
          <ModalBody className="text-center py-6">
            <p className="text-sm text-brand-muted dark:text-white/60 leading-relaxed">
              {badge.description}
            </p>
            <p
              className={cn(
                "mt-3 text-xs font-semibold uppercase tracking-widest",
                RARITY_TEXT[badge.rarity]
              )}
            >
              Badge Earned!
            </p>
          </ModalBody>

          {/* Footer */}
          <ModalFooter className="pb-6">
            <ModalCloseTrigger>
              <Button className="w-full gap-2">
                <span>🎉</span> Awesome!
              </Button>
            </ModalCloseTrigger>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}
