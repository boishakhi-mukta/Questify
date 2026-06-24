import { useUser } from "@clerk/nextjs";
import type { UserRole } from "@/types/auth";

export interface UseUserRoleReturn {
  role: UserRole | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  /** true once Clerk has finished hydrating (use to avoid flash of wrong state) */
  isLoaded: boolean;
  isSignedIn: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded, isSignedIn } = useUser();

  const role = (user?.publicMetadata?.role as UserRole | undefined) ?? null;

  return {
    role,
    isAdmin:    role === "admin",
    isTeacher:  role === "teacher",
    isStudent:  role === "student",
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  };
}
