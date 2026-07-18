/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useXPNotification
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Listens for earned experience points, showing popup notifications on success.
 * 
 * WHY IT EXISTS:
 * Instantly alerts users to game rewards (XP) as they complete tasks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Sets event triggers displaying point milestones.
 * ============================================================================
 */

import { toast } from "sonner";

export type XPEventType = "attendance" | "material" | "assignment" | "quiz" | "bonus";

const EVENT_LABELS: Record<XPEventType, string> = {
  attendance: "Class attended",
  material:   "Material read",
  assignment: "Assignment submitted",
  quiz:       "Quiz completed",
  bonus:      "Bonus XP earned",
};

const EVENT_ICONS: Record<XPEventType, string> = {
  attendance: "📅",
  material:   "📚",
  assignment: "✅",
  quiz:       "🧠",
  bonus:      "🎁",
};

// Provides small popup ("toast") celebrations for the three ways a student
// can be rewarded: earning XP, leveling up, or keeping a daily streak going.
export function useXPNotification() {
  // Shows "+N XP" with a short description of what earned it.
  function showXPEarned(amount: number, type: XPEventType) {
    toast.success(`+${amount} XP`, {
      description: EVENT_LABELS[type],
      icon: EVENT_ICONS[type],
      duration: 4000,
    });
  }

  // Shows a bigger celebration when the student reaches a new level.
  function showLevelUp(newLevel: number) {
    toast.success(`Level ${newLevel} unlocked!`, {
      description: "You've leveled up — keep going!",
      icon: "🎉",
      duration: 6000,
    });
  }

  // Shows a reward for keeping up a multi-day activity streak.
  function showStreakBonus(streak: number, amount: number) {
    toast.success(`${streak}-day streak! +${amount} XP`, {
      description: "Consistency bonus earned",
      icon: "🔥",
      duration: 5000,
    });
  }

  return { showXPEarned, showLevelUp, showStreakBonus };
}
