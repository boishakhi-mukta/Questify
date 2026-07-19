"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useLeaderboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook loading student standings.
 * 
 * WHY IT EXISTS:
 * Powers leaderboard score tables.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries leaderboard endpoints.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { leaderboardApi } from "@/services/api";
import type { LeaderboardEntry } from "@/types/api-response";

export interface UseLeaderboardResult {
  entries:   LeaderboardEntry[];
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

// Loads the ranked list of top students by XP, for the leaderboard pages.
export function useLeaderboard(params?: { timeframe?: string; limit?: number }): UseLeaderboardResult {
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchLeaderboard = useCallback(() => {
    setIsLoading(true);
    setError(null);
    leaderboardApi
      .global(params)
      .then(setEntries)
      .catch((err: Error) => setError(err.message ?? "Failed to load leaderboard"))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, isLoading, error, refetch: fetchLeaderboard };
}
