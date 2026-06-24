import { Response, NextFunction } from "express";
import { AuthorizationError } from "@/utils/errors";
import type { AuthenticatedRequest, UserRole } from "@/types";

/**
 * requireRole — RBAC gate, must be used AFTER verifyJWT.
 * Accepts one or more roles; passes if req.user.role is any of them.
 *
 * @example
 * router.post("/courses", verifyJWT, requireRole("admin", "teacher"), createCourse);
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthorizationError("Authentication required."));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AuthorizationError(
          `Access denied. Required: ${roles.join(" or ")}. You have: ${req.user.role}.`
        )
      );
      return;
    }

    next();
  };
}

/** Convenience aliases for single-role checks */
export const requireAdmin = requireRole("admin");
export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");
export const requireTeacherOrAdmin = requireRole("teacher", "admin");
