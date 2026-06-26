"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useOverlayState } from "@heroui/react";
import { toast } from "sonner";
import { BADGES, type Badge } from "@/lib/badges";
import { useAuth } from "@/hooks/useAuth";

export interface BadgeConditions {
  totalXP?: number;
  completedCourses?: number;
  totalEnrollments?: number;
  rank?: number | null;
}

export interface UseBadgesReturn {
  earnedBadges: string[];
  currentBadge: Badge | null;
  modalState: ReturnType<typeof useOverlayState>;
  awardBadge: (badgeId: string, showModal?: boolean) => void;
  isEarned: (badgeId: string) => boolean;
}

// Conditions map: badge id → function returning whether it's met
function buildConditionMap(c: BadgeConditions): Record<string, boolean> {
  const { totalXP = 0, completedCourses = 0, totalEnrollments = 0, rank = null } = c;
  return {
    "first-login": true,
    "first-course": totalEnrollments >= 1,
    "rising-star": totalXP >= 100,
    "scholar": totalEnrollments >= 3,
    "speed-learner": totalEnrollments >= 5,
    "graduate": completedCourses >= 1,
    "consistent-learner": totalXP >= 500,
    "multi-achiever": completedCourses >= 3,
    "xp-master": totalXP >= 1000,
    "top-performer": rank !== null && rank <= 10,
    "knowledge-seeker": completedCourses >= 5,
    "elite": totalXP >= 5000,
    "leaderboard-king": rank !== null && rank === 1,
  };
}

export function useBadges(conditions: BadgeConditions = {}): UseBadgesReturn {
  const { user } = useAuth();
  const modalState = useOverlayState();

  const storageKey = user ? `questify_badges_${user._id}` : null;

  // Use a Set ref for O(1) dedup that doesn't cause re-renders
  const earnedSet = useRef<Set<string>>(new Set());
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Hydrate from localStorage once storageKey is available
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem(storageKey) ?? "[]"
      );
      stored.forEach((id) => earnedSet.current.add(id));
      setEarnedBadges(stored);
    } catch {
      // corrupted storage — start fresh
    }
    setInitialized(true);
  }, [storageKey]);

  const awardBadge = useCallback(
    (badgeId: string, showModal = true) => {
      if (earnedSet.current.has(badgeId)) return;

      const badge = BADGES.find((b) => b.id === badgeId);
      if (!badge) return;

      earnedSet.current.add(badgeId);
      const next = [...earnedSet.current];

      setEarnedBadges(next);

      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }

      // Toast always
      toast.success(`🏅 Badge Earned: ${badge.name}!`, {
        description: badge.description,
        duration: 4000,
      });

      // Modal only on explicit award (not bulk auto-award on load)
      if (showModal) {
        setCurrentBadge(badge);
        modalState.open();
      }
    },
    [storageKey, modalState]
  );

  // Auto-award badges once storage is hydrated and conditions are known
  const isFirstAutoRun = useRef(true);

  useEffect(() => {
    if (!initialized) return;

    const isInitialRun = isFirstAutoRun.current;
    if (isInitialRun) isFirstAutoRun.current = false;

    const condMap = buildConditionMap(conditions);
    Object.entries(condMap).forEach(([id, met]) => {
      if (met) awardBadge(id, !isInitialRun); // no modal on first load
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialized,
    conditions.totalXP,
    conditions.completedCourses,
    conditions.totalEnrollments,
    conditions.rank,
  ]);

  const isEarned = useCallback(
    (badgeId: string) => earnedSet.current.has(badgeId),
    []
  );

  return { earnedBadges, currentBadge, modalState, awardBadge, isEarned };
}
