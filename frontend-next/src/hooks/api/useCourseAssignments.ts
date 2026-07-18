"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useCourseAssignments
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook loading course tasks.
 * 
 * WHY IT EXISTS:
 * Powers assignments displays.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries course assignment deadlines.
 * ============================================================================
 */

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

// Loads the list of assignments for a course, and provides a way for a
// student to submit their completed work for one of them.
export function useCourseAssignments(courseId: string): UseCourseAssignmentsResult {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Goes to the server and (re)loads this course's assignments.
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

  // Sends a student's completed assignment to the server to be graded.
  const submit = async (payload: SubmitAssignmentPayload) => {
    return assignmentsApi.submit(payload);
  };

  return { assignments, isLoading, error, refetch: fetchAssignments, submit };
}
