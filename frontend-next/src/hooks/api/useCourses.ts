"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useCourses
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook loading the courses list.
 * 
 * WHY IT EXISTS:
 * Fetches course catalogs.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries courses listing search API routes.
 * ============================================================================
 */

import { useState, useEffect, useRef } from "react";
import { coursesApi, type CourseListParams } from "@/services/api";
import type { Course, PaginationMeta } from "@/types/api-response";

export interface UseCoursesResult {
  courses:    Course[];
  pagination: PaginationMeta | null;
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
}

// Loads the browsable list of courses (for the course catalogue page),
// optionally filtered/sorted/searched using the given params.
export function useCourses(params?: CourseListParams): UseCoursesResult {
  const [courses, setCourses]       = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const paramsKey = JSON.stringify(params ?? {});
  const prevKey   = useRef<string | null>(null);

  // Goes to the server and loads the course list matching the current filters.
  const fetch = () => {
    setIsLoading(true);
    setError(null);
    coursesApi
      .list(params)
      .then((res) => {
        setCourses(res.data);
        setPagination(res.pagination);
      })
      .catch((err: Error) => setError(err.message ?? "Failed to load courses"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (prevKey.current === paramsKey) return;
    prevKey.current = paramsKey;
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { courses, pagination, isLoading, error, refetch: fetch };
}
