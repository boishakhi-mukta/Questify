"use client";

import { useState } from "react";
import { enrollmentsApi } from "@/services/api";

export interface UseEnrollCourseResult {
  enroll:     (courseId: string) => Promise<void>;
  unenroll:   (enrollmentId: string) => Promise<void>;
  isLoading:  boolean;
  error:      string | null;
}

export function useEnrollCourse(onSuccess?: () => void): UseEnrollCourseResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const enroll = async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await enrollmentsApi.enroll(courseId);
      onSuccess?.();
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
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unenrollment failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { enroll, unenroll, isLoading, error };
}
