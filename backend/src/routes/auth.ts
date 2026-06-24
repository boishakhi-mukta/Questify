import { Router } from "express";
import { z } from "zod";
import { verifyJWT } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { authLimiter } from "@/middleware/rateLimiter";
import * as Auth from "@/controllers/auth.controller";

// ── Zod schemas ────────────────────────────────────────────────────────────────
const passwordSchema = z
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

const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .trim(),
  password: passwordSchema,
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z
  .object({
    firstName: z.string().min(2).max(50).trim().optional(),
    lastName: z.string().min(2).max(50).trim().optional(),
    avatar: z.string().url("Avatar must be a valid URL").optional(),
    profile: z
      .object({
        bio: z.string().max(500, "Bio must be at most 500 characters").trim().optional(),
        location: z
          .string()
          .max(100, "Location must be at most 100 characters")
          .trim()
          .optional(),
        phone: z
          .string()
          .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format")
          .optional(),
        educationLevel: z.string().max(100).optional(),
        socialLinks: z.array(z.string().url("Each link must be a valid URL")).max(10).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

// ── Router ─────────────────────────────────────────────────────────────────────
const router = Router();

// Public — rate-limited
router.post("/register", authLimiter, validateBody(registerSchema), Auth.register);
router.post("/login", authLimiter, validateBody(loginSchema), Auth.login);

// Protected
router.post("/logout", verifyJWT, Auth.logout);
router.get("/me", verifyJWT, Auth.getMe);
router.patch("/profile", verifyJWT, validateBody(updateProfileSchema), Auth.updateProfile);

export default router;
