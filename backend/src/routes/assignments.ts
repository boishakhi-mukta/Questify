import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  idParamSchema,
  courseIdParamSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  extendDeadlineSchema,
  paginationQuerySchema,
} from "@/utils/validators";
import * as Assignments from "@/controllers/assignment.controller";

const router = Router();

// All assignment routes require authentication
router.use(verifyJWT);

// NOTE: /course/:courseId is a static-prefix route (2 segments) and must be
// declared before /:id (1 segment) so Express matches it correctly.
router.get(
  "/course/:courseId",
  validateParams(courseIdParamSchema),
  validateQuery(paginationQuerySchema),
  Assignments.getCourseAssignments
);

// /:id/extend-deadline must be declared before /:id so the POST sub-route
// is not shadowed.
router.post(
  "/:id/extend-deadline",
  requireTeacherOrAdmin,
  validateParams(idParamSchema),
  validateBody(extendDeadlineSchema),
  Assignments.extendDeadline
);

router.get(
  "/:id",
  validateParams(idParamSchema),
  Assignments.getAssignmentById
);

router.post(
  "/",
  requireTeacherOrAdmin,
  validateBody(createAssignmentSchema),
  Assignments.createAssignment
);

router.patch(
  "/:id",
  requireTeacherOrAdmin,
  validateParams(idParamSchema),
  validateBody(updateAssignmentSchema),
  Assignments.updateAssignment
);

router.delete(
  "/:id",
  requireTeacherOrAdmin,
  validateParams(idParamSchema),
  Assignments.deleteAssignment
);

export default router;
