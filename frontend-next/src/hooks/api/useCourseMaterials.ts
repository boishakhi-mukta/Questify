"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useCourseMaterials
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook loading syllabus documents list.
 * 
 * WHY IT EXISTS:
 * Powers files widgets.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries materials API endpoints.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { materialsApi } from "@/services/api";
import type { Material } from "@/types/api-response";

export interface UseCourseMaterialsResult {
  materials:  Material[];
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
}

// Loads the list of study materials (PDFs, videos, links, etc.) for one course.
export function useCourseMaterials(courseId: string): UseCourseMaterialsResult {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Goes to the server and (re)loads this course's materials.
  const fetchMaterials = useCallback(() => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    materialsApi
      .byCourse(courseId)
      .then(setMaterials)
      .catch((err: Error) => setError(err.message ?? "Failed to load materials"))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return { materials, isLoading, error, refetch: fetchMaterials };
}
