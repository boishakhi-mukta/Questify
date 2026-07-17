"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useEnrollCourse
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom command hook executing self-enroll calls.
 * 
 * WHY IT EXISTS:
 * Enables self-enrollment.
 * 
 * HOW IT WORKS (Technical Overview):
 * Submits POST requests to course enrollment endpoints.
 * ============================================================================
 */

import { useState } from "react";
import { enrollmentsApi } from "@/services/api";

export interface UseEnrollCourseResult {
  enroll:     (courseId: string) => Promise<void>;
  unenroll:   (enrollmentId: string) => Promise<void>;
  isLoading:  boolean;
  error:      string | null;
}

export function useEnrollCourse(onSuccess?: () => void | Promise<void>): UseEnrollCourseResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const enroll = async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await enrollmentsApi.enroll(courseId);
      // Wait for the caller's refetch so `isLoading` doesn't clear until the
      // enrolled-state the UI reads from (e.g. useMyEnrollments) is current —
      // otherwise the button flashes back to its pre-enroll state for a beat.
      await onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unenroll = async (enrollmentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await enrollmentsApi.unenroll(enrollmentId);
      await onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unenrollment failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { enroll, unenroll, isLoading, error };
}
