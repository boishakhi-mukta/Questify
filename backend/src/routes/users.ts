import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/rbac";
import { validateBody, validateParams } from "@/middleware/validation";
import { AuthorizationError } from "@/utils/errors";
import type { AuthenticatedRequest } from "@/types";
import * as Users from "@/controllers/user.controller";

// ── Schemas ────────────────────────────────────────────────────────────────────
const idSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid user ID"),
});

const updateUserSchema = z
  .object({
    firstName: z.string().min(2).max(50).trim().optional(),
    lastName: z.string().min(2).max(50).trim().optional(),
    email: z.string().email("Invalid email address").toLowerCase().optional(),
    isActive: z.boolean().optional(),
    profile: z
      .object({
        bio: z.string().max(500).trim().optional(),
        location: z.string().max(100).trim().optional(),
        phone: z
          .string()
          .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
          .optional(),
        educationLevel: z.string().max(100).optional(),
        socialLinks: z.array(z.string().url()).max(10).optional(),
      })
      .optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

const newPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character"
  );

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: newPasswordSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

const updateAvatarSchema = z.object({
  avatar: z.string().url("Avatar must be a valid URL"),
});

// ── Authorization helper: caller must own the resource or be an admin ──────────
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

// Public
router.get("/:id", validateParams(idSchema), Users.getUser);

// Protected — authenticated, no role restriction (any user can view any profile)
router.get(
  "/:id/profile",
  verifyJWT,
  validateParams(idSchema),
  Users.getProfile
);

// Protected — admin only
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

// Protected — self or admin
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

export default router;
