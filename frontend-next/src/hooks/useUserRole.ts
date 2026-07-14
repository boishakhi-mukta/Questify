/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useUserRole
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Inspects credentials to determine user authorization roles.
 * 
 * WHY IT EXISTS:
 * Restricts UI layouts based on user roles (Admin, Teacher, Student).
 * 
 * HOW IT WORKS (Technical Overview):
 * Decodes user token payload claims.
 * ============================================================================
 */

import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

export interface UseUserRoleReturn {
  role:      UserRole | null;
  isAdmin:   boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isLoaded:  boolean;
  isSignedIn: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const { user, isAuthenticated, isLoading } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    isAdmin:    role === "admin",
    isTeacher:  role === "teacher",
    isStudent:  role === "student",
    isLoaded:   !isLoading,
    isSignedIn: isAuthenticated,
  };
}
