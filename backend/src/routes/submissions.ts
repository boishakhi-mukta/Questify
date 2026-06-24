import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireStudent, requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  submissionIdParamSchema,
  assignmentIdParamSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
  submissionsQuerySchema,
  mySubmissionsQuerySchema,
} from "@/utils/validators";
import {
  submitAssignment,
  getSubmissions,
  getSubmissionById,
  gradeSubmission,
  getStudentSubmissions,
} from "@/controllers/submission.controller";

const router = Router();

router.use(verifyJWT);

// NOTE: Static-prefix routes (/my, /assignment/:id) must be declared before
// the single-segment /:id param routes to prevent Express from swallowing
// "my" or "assignment" as an ObjectId value.

// GET /my — student's own submission history
router.get(
  "/my",
  requireStudent,
  validateQuery(mySubmissionsQuerySchema),
  getStudentSubmissions
);

// GET /assignment/:assignmentId — teacher views all submissions for an assignment
router.get(
  "/assignment/:assignmentId",
  requireTeacherOrAdmin,
  validateParams(assignmentIdParamSchema),
  validateQuery(submissionsQuerySchema),
  getSubmissions
);

// POST / — student submits an assignment
router.post(
  "/",
  requireStudent,
  validateBody(submitAssignmentSchema),
  submitAssignment
);

// PATCH /:id/grade — teacher grades a submission
router.patch(
  "/:id/grade",
  requireTeacherOrAdmin,
  validateParams(submissionIdParamSchema),
  validateBody(gradeSubmissionSchema),
  gradeSubmission
);

// GET /:id — single submission (student views own; teacher views course submissions)
router.get(
  "/:id",
  validateParams(submissionIdParamSchema),
  getSubmissionById
);

export default router;
