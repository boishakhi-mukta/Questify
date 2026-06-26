"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminCoursesApi,
  type AdminListCoursesParams,
  type AdminCreateCoursePayload,
  type AdminUpdateCoursePayload,
} from "@/services/api";
import type { Course, PaginationMeta } from "@/types/api-response";

export interface UseAdminCoursesResult {
  courses:    Course[];
  pagination: PaginationMeta | null;
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
  create:     (payload: AdminCreateCoursePayload) => Promise<Course>;
  update:     (id: string, payload: AdminUpdateCoursePayload) => Promise<Course>;
  remove:     (id: string) => Promise<void>;
}

export function useAdminCourses(params?: AdminListCoursesParams): UseAdminCoursesResult {
  const [courses, setCourses]       = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchCourses = useCallback(() => {
    setIsLoading(true);
    setError(null);
    adminCoursesApi
      .list(params)
      .then((res) => {
        setCourses(res.data);
        setPagination(res.pagination);
      })
      .catch((err: Error) => setError(err.message ?? "Failed to load courses"))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const create = async (payload: AdminCreateCoursePayload) => {
    const result = await adminCoursesApi.create(payload);
    fetchCourses();
    return result.course;
  };

  const update = async (id: string, payload: AdminUpdateCoursePayload) => {
    const result = await adminCoursesApi.update(id, payload);
    fetchCourses();
    return result.course;
  };

  const remove = async (id: string) => {
    await adminCoursesApi.remove(id);
    fetchCourses();
  };

  return { courses, pagination, isLoading, error, refetch: fetchCourses, create, update, remove };
}
