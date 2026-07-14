/**
 * ============================================================================
 * QUESTIFY ROUTES: Enrollments Router
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Configures class enrollment URLs.
 * 
 * WHY IT EXISTS:
 * Connects registration requests to controllers.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exposes methods to view and create enrollments.
 * ============================================================================
 */

import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  idParamSchema,
  courseIdParamSchema,
  studentIdParamSchema,
  adminUpdateEnrollmentSchema,
  listEnrollmentsQuerySchema,
  courseEnrollmentsQuerySchema,
  studentEnrollmentsQuerySchema,
} from "@/utils/validators";
import {
  listEnrollments,
  getCourseEnrollments,
  getStudentEnrollmentsAdmin,
  adminUpdateEnrollment,
  adminDropEnrollment,
} from "@/controllers/enrollment.controller";

const router = Router();

// All admin enrollment routes require authentication and admin role
router.use(verifyJWT, requireAdmin);

// NOTE: Static-prefix routes (/course/:courseId, /student/:studentId) must be
// declared before /:id so Express does not misroute "course" or "student" as
// an enrollment ObjectId.

router.get(
  "/course/:courseId",
  validateParams(courseIdParamSchema),
  validateQuery(courseEnrollmentsQuerySchema),
  getCourseEnrollments
);

router.get(
  "/student/:studentId",
  validateParams(studentIdParamSchema),
  validateQuery(studentEnrollmentsQuerySchema),
  getStudentEnrollmentsAdmin
);

router.get(
  "/",
  validateQuery(listEnrollmentsQuerySchema),
  listEnrollments
);

router.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(adminUpdateEnrollmentSchema),
  adminUpdateEnrollment
);

router.delete(
  "/:id",
  validateParams(idParamSchema),
  adminDropEnrollment
);

export default router;
