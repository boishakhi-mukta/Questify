import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin, requireTeacherOrAdmin, requireStudent } from "@/middleware/rbac";
import { validateParams, validateQuery } from "@/middleware/validation";
import {
  courseIdParamSchema,
  userIdParamSchema,
  xpAnalyticsQuerySchema,
} from "@/utils/validators";
import {
  getCourseAnalytics,
  getSelfAnalytics,
  getUserAnalytics,
  getEnrollmentAnalytics,
  getXPAnalytics,
  getLeaderboard,
} from "@/controllers/analytics.controller";

const router = Router();

router.use(verifyJWT);

// Teacher/Admin — analytics for a specific course
router.get(
  "/course/:courseId",
  requireTeacherOrAdmin,
  validateParams(courseIdParamSchema),
  getCourseAnalytics
);

// Student — own learning analytics
router.get("/user", requireStudent, getSelfAnalytics);

// Admin — analytics for any user
router.get(
  "/users/:userId",
  requireAdmin,
  validateParams(userIdParamSchema),
  getUserAnalytics
);

// Admin — platform-wide enrollment analytics
router.get("/enrollments", requireAdmin, getEnrollmentAnalytics);

// Admin — XP analytics (optionally scoped to a course)
router.get("/xp", requireAdmin, validateQuery(xpAnalyticsQuerySchema), getXPAnalytics);

// All authenticated users — global XP leaderboard
router.get("/leaderboard", getLeaderboard);

export default router;
