"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: LevelUpModal
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A celebratory pop-up window (modal) that bursts onto the screen when a
 * student increases their level, complete with encouraging animations.
 * 
 * WHY IT EXISTS:
 * To reward student progress and build excitement around leveling up, making
 * the learning experience feel like a fun educational quest.
 * 
 * HOW IT WORKS (Technical Overview):
 * Listens for state changes in level/experience, uses Framer Motion for
 * transition animations, and displays the congratulatory screen using dialog overlays.
 * ============================================================================
 */

import {
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalBody,
  ModalFooter,
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
  useOverlayState,
} from "@heroui/react";
import { Button } from "@/components/ui/button";

interface LevelUpModalProps {
  state:         ReturnType<typeof useOverlayState>;
  newLevel:      number;
  xpToNextLevel: number;
  xpEarned?:    number;
}

// The "Level Up!" celebration popup shown when a student reaches a new level.
export function LevelUpModal({ state, newLevel, xpToNextLevel, xpEarned }: LevelUpModalProps) {
  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="sm" placement="center">
        <ModalDialog>
          {/* Celebration emoji */}
          <div className="flex justify-center pt-8 pb-2">
            <span
              className="text-6xl leading-none animate-bounce"
              role="img"
              aria-label="celebration"
            >
              🎉
            </span>
          </div>

          <ModalBody className="text-center space-y-4 pb-2">
            {/* Level badge */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-400/30 flex items-center justify-center">
                <span className="text-2xl font-black text-white">{newLevel}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                Level Up!
              </p>
              <p className="text-[15px] font-semibold text-brand-body dark:text-white/70">
                You've reached Level {newLevel}
              </p>
            </div>

            {xpEarned != null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[13px] font-bold">
                <span>⭐</span>
                <span>+{xpEarned.toLocaleString()} XP earned</span>
              </div>
            )}

            {/* Progress bar toward next level */}
            <div className="text-left space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-brand-body/55 dark:text-white/40">
                <span>Progress to Level {newLevel + 1}</span>
                <span>{xpToNextLevel.toLocaleString()} XP to go</span>
              </div>
              <ProgressBarRoot
                value={0}
                minValue={0}
                maxValue={100}
                aria-label={`Progress to level ${newLevel + 1}`}
                color="accent"
                size="sm"
              >
                <ProgressBarTrack>
                  <ProgressBarFill />
                </ProgressBarTrack>
              </ProgressBarRoot>
            </div>
          </ModalBody>

          <ModalFooter className="justify-center pt-4 pb-6">
            <Button
              variant="default"
              className="px-10"
              onClick={state.close}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}
