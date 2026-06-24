import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireStudent } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  courseIdParamSchema,
  enrollmentIdParamSchema,
  selfEnrollSchema,
  myEnrollmentsQuerySchema,
} from "@/utils/validators";
import {
  selfEnroll,
  getMyEnrollments,
  getMyEnrollmentByCourse,
  selfUnenroll,
} from "@/controllers/enrollment.controller";

const router = Router();

// All routes require a valid JWT and the student role
router.use(verifyJWT, requireStudent);

// NOTE: /enroll is a static segment and must be declared before /:courseId so
// Express does not treat the word "enroll" as a courseId ObjectId param.
router.post(
  "/enroll",
  validateBody(selfEnrollSchema),
  selfEnroll
);

router.get(
  "/",
  validateQuery(myEnrollmentsQuerySchema),
  getMyEnrollments
);

router.get(
  "/:courseId",
  validateParams(courseIdParamSchema),
  getMyEnrollmentByCourse
);

router.delete(
  "/:enrollmentId",
  validateParams(enrollmentIdParamSchema),
  selfUnenroll
);

export default router;
