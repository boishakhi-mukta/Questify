"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useMyEnrollments
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook loading enrolled courses.
 * 
 * WHY IT EXISTS:
 * Populates student dashboards.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries student enrollments routes.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { enrollmentsApi } from "@/services/api";
import type { EnrollmentWithCourse } from "@/types/api-response";

export interface UseMyEnrollmentsResult {
  enrollments: EnrollmentWithCourse[];
  isLoading:   boolean;
  error:       string | null;
  refetch:     () => Promise<void>;
}

// Loads the list of courses the current student is enrolled in (used by "My
// Courses" and anywhere else that needs to know what a student has signed up for).
// Pass `enabled: false` to skip fetching, e.g. when nobody is logged in yet.
export function useMyEnrollments(enabled: boolean = true): UseMyEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [isLoading, setIsLoading]     = useState(enabled);
  const [error, setError]             = useState<string | null>(null);

  // Goes to the server and (re)loads the student's enrollments.
  const fetchEnrollments = useCallback(() => {
    if (!enabled) {
      setIsLoading(false);
      return Promise.resolve();
    }
    setIsLoading(true);
    setError(null);
    return enrollmentsApi
      .mine()
      .then(setEnrollments)
      .catch((err: Error) => setError(err.message ?? "Failed to load enrollments"))
      .finally(() => setIsLoading(false));
  }, [enabled]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, isLoading, error, refetch: fetchEnrollments };
}
