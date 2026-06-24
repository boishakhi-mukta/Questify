import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import { strictLimiter } from "@/middleware/rateLimiter";
import { AuthorizationError } from "@/utils/errors";
import type { AuthenticatedRequest } from "@/types";
import * as Users from "@/controllers/user.controller";

// ── Shared schemas ─────────────────────────────────────────────────────────────
const idSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid user ID"),
});

const passwordStrengthSchema = z
  .string()
  .min(8,   "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/\d/,    "Must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Must contain at least one special character");

const singleUserSchema = z.object({
  email:     z.string().email("Invalid email address").toLowerCase(),
  firstName: z.string().min(1).max(50).trim(),
  lastName:  z.string().min(1).max(50).trim(),
  role:      z.enum(["student", "teacher"], {
    errorMap: () => ({ message: 'Role must be "student" or "teacher"' }),
  }),
});

const createUserSchema = singleUserSchema;

const updateUserSchema = z
  .object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName:  z.string().min(1).max(50).trim().optional(),
    role:      z.enum(["admin", "teacher", "student"]).optional(),
    isActive:  z.boolean().optional(),
    avatar:    z.string().url("Avatar must be a valid URL").optional(),
    profile: z
      .object({
        bio:            z.string().max(500).trim().optional(),
        location:       z.string().max(100).trim().optional(),
        phone:          z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number").optional(),
        educationLevel: z.string().max(100).optional(),
        socialLinks:    z.array(z.string().url()).max(10).optional(),
      })
      .optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

const bulkCreateSchema = z.object({
  users: z
    .array(singleUserSchema)
    .min(1,   "At least one user is required")
    .max(100, "Maximum 100 users per bulk request"),
});

const listUsersQuerySchema = z.object({
  page:     z.coerce.number().int().positive().optional(),
  limit:    z.coerce.number().int().positive().max(100).optional(),
  search:   z.string().max(100).optional(),
  role:     z.enum(["admin", "teacher", "student"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort:     z.enum(["createdAt", "updatedAt", "firstName", "lastName", "email", "role", "lastLogin"]).optional(),
  order:    z.enum(["asc", "desc"]).optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     passwordStrengthSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path:    ["newPassword"],
  });

const updateAvatarSchema = z.object({
  avatar: z.string().url("Avatar must be a valid URL"),
});

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

// ── Router ─────────────────────────────────────────────────────────────────────
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
  validateBody(bulkCreateSchema),
  Users.bulkCreateUsers
);

// ── Parametric: profile (authenticated) ───────────────────────────────────────
router.get(
  "/:id/profile",
  verifyJWT,
  validateParams(idSchema),
  Users.getProfile
);

// ── Parametric: admin reset-password ──────────────────────────────────────────
router.post(
  "/:id/reset-password",
  verifyJWT,
  requireAdmin,
  strictLimiter,
  validateParams(idSchema),
  Users.resetPassword
);

// ── Parametric: self-or-admin endpoints ───────────────────────────────────────
router.post(
  "/:id/change-password",
  verifyJWT,
  validateParams(idSchema),
  requireSelfOrAdmin,
  validateBody(changePasswordSchema),
  Users.changePassword
);

router.patch(
  "/:id/avatar",
  verifyJWT,
  validateParams(idSchema),
  requireSelfOrAdmin,
  validateBody(updateAvatarSchema),
  Users.updateAvatar
);

// ── Parametric: admin full detail, update, delete ─────────────────────────────
router.get(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idSchema),
  Users.getUserDetails
);

router.patch(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idSchema),
  validateBody(updateUserSchema),
  Users.updateUser
);

router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idSchema),
  Users.deleteUser
);

export default router;
