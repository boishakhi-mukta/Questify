import { Router } from "express";
import { z } from "zod";
import { verifyJWT } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { authLimiter, loginHardLimiter, strictLimiter } from "@/middleware/rateLimiter";
import * as Auth from "@/controllers/auth.controller";

// ── Shared validators ──────────────────────────────────────────────────────────
const passwordStrengthSchema = z
  .string()
  .min(8,   "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/,                       "Password must contain at least one uppercase letter")
  .regex(/[a-z]/,                       "Password must contain at least one lowercase letter")
  .regex(/\d/,                          "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character"
  );

// ── Route schemas ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     passwordStrengthSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from your current password",
    path:    ["newPassword"],
  });

const updateProfileSchema = z
  .object({
    firstName: z.string().min(2).max(50).trim().optional(),
    lastName:  z.string().min(2).max(50).trim().optional(),
    avatar:    z.string().url("Avatar must be a valid URL").optional(),
    profile: z
      .object({
        bio:           z.string().max(500).trim().optional(),
        location:      z.string().max(100).trim().optional(),
        phone:         z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number").optional(),
        educationLevel: z.string().max(100).optional(),
        socialLinks:   z.array(z.string().url()).max(10).optional(),
      })
      .optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

// ── Router ─────────────────────────────────────────────────────────────────────
const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
// Two rate limiters stacked on login:
//   loginHardLimiter — 10 failed attempts / 15 min (fail-safe)
//   authLimiter      —  5 failed attempts / min  (burst protection)
// Both use skipSuccessfulRequests: true so only failures count.
router.post(
  "/login",
  loginHardLimiter,
  authLimiter,
  validateBody(loginSchema),
  Auth.login
);

// ── Protected ──────────────────────────────────────────────────────────────────
router.post("/logout",  verifyJWT, Auth.logout);
router.get("/me",       verifyJWT, Auth.getMe);

// strictLimiter (3 / 15 min) guards against brute-force on the old-password field
router.post(
  "/change-password",
  verifyJWT,
  strictLimiter,
  validateBody(changePasswordSchema),
  Auth.changePassword
);

router.patch(
  "/profile",
  verifyJWT,
  validateBody(updateProfileSchema),
  Auth.updateProfile
);

export default router;
