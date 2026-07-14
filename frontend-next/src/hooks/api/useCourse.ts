"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useCourse
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook loading course details.
 * 
 * WHY IT EXISTS:
 * Powers details pages.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries course details by ID.
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { coursesApi } from "@/services/api";
import type { Course } from "@/types/api-response";

export interface UseCourseResult {
  course:    Course | null;
  isLoading: boolean;
  error:     string | null;
}

export function useCourse(id: string): UseCourseResult {
  const [course, setCourse]       = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    coursesApi
      .getById(id)
      .then((res) => setCourse(res.course))
      .catch((err: Error) => setError(err.message ?? "Course not found"))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { course, isLoading, error };
}
