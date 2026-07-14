/**
 * ============================================================================
 * QUESTIFY ROUTES: Users Router
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Configures user directory management endpoints.
 * 
 * WHY IT EXISTS:
 * Controls user-profile URLs.
 * 
 * HOW IT WORKS (Technical Overview):
 * Enforces admin authorization check checks for users.
 * ============================================================================
 */

import { Router, Response, NextFunction } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import { strictLimiter } from "@/middleware/rateLimiter";
import { AuthorizationError } from "@/utils/errors";
import {
  idParamSchema,
  createUserSchema,
  updateUserSchema,
  updateAvatarSchema,
  bulkCreateUserSchema,
  listUsersQuerySchema,
  changePasswordSchema,
} from "@/utils/validators";
import type { AuthenticatedRequest } from "@/types";
import * as Users from "@/controllers/user.controller";

// ── Authorization helper ───────────────────────────────────────────────────────
function requireSelfOrAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.id === req.params.id || req.user?.role === "admin") {
    return next();
  }
  next(new AuthorizationError());
}

const router = Router();

// IMPORTANT: Static routes must be declared before /:id to prevent Express
// from matching "bulk" as an ObjectId parameter.

// ── Admin: list + create ───────────────────────────────────────────────────────
router.get(
  "/",
  verifyJWT,
  requireAdmin,
  validateQuery(listUsersQuerySchema),
  Users.listUsers
);

router.post(
  "/",
  verifyJWT,
  requireAdmin,
  validateBody(createUserSchema),
  Users.createUser
);

// ── Admin: bulk create ─────────────────────────────────────────────────────────
router.post(
  "/bulk",
  verifyJWT,
  requireAdmin,
  validateBody(bulkCreateUserSchema),
  Users.bulkCreateUsers
);

// ── Parametric: profile (authenticated) ───────────────────────────────────────
router.get(
  "/:id/profile",
  verifyJWT,
  validateParams(idParamSchema),
  Users.getProfile
);

// ── Parametric: admin reset-password ──────────────────────────────────────────
router.post(
  "/:id/reset-password",
  verifyJWT,
  requireAdmin,
  strictLimiter,
  validateParams(idParamSchema),
  Users.resetPassword
);

// ── Parametric: self-or-admin endpoints ───────────────────────────────────────
router.post(
  "/:id/change-password",
  verifyJWT,
  validateParams(idParamSchema),
  requireSelfOrAdmin,
  validateBody(changePasswordSchema),
  Users.changePassword
);

router.patch(
  "/:id/avatar",
  verifyJWT,
  validateParams(idParamSchema),
  requireSelfOrAdmin,
  validateBody(updateAvatarSchema),
  Users.updateAvatar
);

// ── Parametric: admin full detail, update, delete ─────────────────────────────
router.get(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idParamSchema),
  Users.getUserDetails
);

router.patch(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  Users.updateUser
);

router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idParamSchema),
  Users.deleteUser
);

export default router;
