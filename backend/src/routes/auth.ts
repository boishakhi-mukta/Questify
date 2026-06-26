import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { authLimiter, loginHardLimiter, strictLimiter } from "@/middleware/rateLimiter";
import { loginSchema, refreshTokenSchema, changePasswordSchema, updateProfileSchema } from "@/utils/validators";
import * as Auth from "@/controllers/auth.controller";

const router = Router();

// Public — two rate limiters stacked: burst + sustained
router.post(
  "/login",
  loginHardLimiter,
  authLimiter,
  validateBody(loginSchema),
  Auth.login
);

router.post(
  "/refresh",
  authLimiter,
  validateBody(refreshTokenSchema),
  Auth.refreshToken
);

// Protected
router.post("/logout",  verifyJWT, Auth.logout);
router.get("/me",       verifyJWT, Auth.getMe);

// strictLimiter guards against brute-force on the old-password field
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
