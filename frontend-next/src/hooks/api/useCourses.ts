"use client";

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

export function useCourses(params?: CourseListParams): UseCoursesResult {
  const [courses, setCourses]       = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const paramsKey = JSON.stringify(params ?? {});
  const prevKey   = useRef<string | null>(null);

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
