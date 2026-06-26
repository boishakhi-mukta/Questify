"use client";

import { useState, useEffect, useCallback } from "react";
import { assignmentsApi, type SubmitAssignmentPayload } from "@/services/api";
import type { Assignment, Submission } from "@/types/api-response";

export interface UseCourseAssignmentsResult {
  assignments: Assignment[];
  isLoading:   boolean;
  error:       string | null;
  refetch:     () => void;
  submit:      (payload: SubmitAssignmentPayload) => Promise<Submission>;
}

export function useCourseAssignments(courseId: string): UseCourseAssignmentsResult {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchAssignments = useCallback(() => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    assignmentsApi
      .byCourse(courseId)
      .then(setAssignments)
      .catch((err: Error) => setError(err.message ?? "Failed to load assignments"))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const submit = async (payload: SubmitAssignmentPayload) => {
    return assignmentsApi.submit(payload);
  };

  return { assignments, isLoading, error, refetch: fetchAssignments, submit };
}
