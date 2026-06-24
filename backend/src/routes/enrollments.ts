import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyJWT } from "@/middleware/auth";
import {
  requireStudent,
  requireTeacher,
  requireTeacherOrAdmin,
} from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import * as Enrollments from "@/controllers/enrollment.controller";

// ── Param schemas ──────────────────────────────────────────────────────────────
const idSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid enrollment ID"),
});

// ── Body schemas ───────────────────────────────────────────────────────────────
const enrollSchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId"),
});

const updateProgressSchema = z.object({
  progressPercentage: z
    .number({
      required_error: "progressPercentage is required",
      invalid_type_error: "progressPercentage must be a number",
    })
    .min(0, "progressPercentage must be at least 0")
    .max(100, "progressPercentage must not exceed 100"),
});

// ── Query schemas ──────────────────────────────────────────────────────────────
const listEnrollmentsQuerySchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId")
    .optional(),
  studentId: z
    .string()
    .refine(Types.ObjectId.isValid, "studentId must be a valid ObjectId")
    .optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

const myEnrollmentsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

const teachingEnrollmentsQuerySchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId")
    .optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

// ── Router ─────────────────────────────────────────────────────────────────────
const router = Router();

// All enrollment routes require authentication
router.use(verifyJWT);

// NOTE: /my and /teaching are static-prefix routes and MUST be declared before
// /:id so Express does not interpret "my" or "teaching" as a MongoDB ObjectId.
router.get(
  "/my",
  requireStudent,
  validateQuery(myEnrollmentsQuerySchema),
  Enrollments.getStudentEnrollments
);

router.get(
  "/teaching",
  requireTeacher,
  validateQuery(teachingEnrollmentsQuerySchema),
  Enrollments.getTeacherEnrollments
);

// POST / — student enrols themselves
router.post(
  "/",
  requireStudent,
  validateBody(enrollSchema),
  Enrollments.enrollStudent
);

// GET / — admin or teacher list (with optional filters)
router.get(
  "/",
  requireTeacherOrAdmin,
  validateQuery(listEnrollmentsQuerySchema),
  Enrollments.getEnrollments
);

// DELETE /:id — student drops their own enrollment
router.delete(
  "/:id",
  requireStudent,
  validateParams(idSchema),
  Enrollments.unenrollStudent
);

// PATCH /:id/progress — teacher updates a student's progress
// NOTE: /:id/progress is declared last but uses PATCH, which does not conflict
// with DELETE /:id (different HTTP method) or GET /my|/teaching (static paths).
router.patch(
  "/:id/progress",
  requireTeacherOrAdmin,
  validateParams(idSchema),
  validateBody(updateProgressSchema),
  Enrollments.updateEnrollmentProgress
);

export default router;
