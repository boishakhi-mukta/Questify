"use client";

import { useState, useEffect, useCallback } from "react";
import { enrollmentsApi } from "@/services/api";
import type { EnrollmentWithCourse } from "@/types/api-response";

export interface UseMyEnrollmentsResult {
  enrollments: EnrollmentWithCourse[];
  isLoading:   boolean;
  error:       string | null;
  refetch:     () => void;
}

export function useMyEnrollments(): UseMyEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchEnrollments = useCallback(() => {
    setIsLoading(true);
    setError(null);
    enrollmentsApi
      .mine()
      .then(setEnrollments)
      .catch((err: Error) => setError(err.message ?? "Failed to load enrollments"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, isLoading, error, refetch: fetchEnrollments };
}
