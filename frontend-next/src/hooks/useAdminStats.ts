/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useAdminStats
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Loads global usage metrics (student counts, course counts).
 * 
 * WHY IT EXISTS:
 * Supplies dashboard widgets with aggregated stats.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries administrative analytics routes.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalXPDistributed: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Loads the platform-wide numbers (total students, teachers, courses, XP
// given out) for the admin dashboard, and gives back a way to reload them.
export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Does the actual work of going to the server and asking for the stats.
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData(json.data as AdminStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
