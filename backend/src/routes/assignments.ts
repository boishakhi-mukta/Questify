import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyJWT } from "@/middleware/auth";
import { requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import * as Assignments from "@/controllers/assignment.controller";

// ── Param schemas ──────────────────────────────────────────────────────────────
const idSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid assignment ID"),
});

const courseIdParamSchema = z.object({
  courseId: z.string().refine(Types.ObjectId.isValid, "Invalid course ID"),
});

// ── Body schemas ───────────────────────────────────────────────────────────────
const createAssignmentSchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200)
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2_000)
    .trim(),
  instructions: z.string().max(10_000).trim().optional(),
  dueDate: z
    .string()
    .datetime({ message: "dueDate must be a valid ISO 8601 datetime string" })
    .refine((d) => new Date(d) > new Date(), {
      message: "dueDate must be in the future",
    }),
  totalPoints: z.number().int().min(1).max(1_000).optional(),
  submissionType: z.enum(["TEXT", "FILE", "LINK", "CODE"], {
    errorMap: () => ({ message: "submissionType must be TEXT, FILE, LINK, or CODE" }),
  }),
  allowLateSubmission: z.boolean().optional(),
  latePenalty: z.number().min(0).max(100).optional(),
  attachments: z.array(z.string().url("Each attachment must be a valid URL")).max(10).optional(),
});

// courseId is intentionally excluded — reassigning an assignment requires
// delete + create to keep submission FK integrity.
const updateAssignmentSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200)
      .trim()
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2_000)
      .trim()
      .optional(),
    instructions: z.string().max(10_000).trim().optional(),
    dueDate: z
      .string()
      .datetime({ message: "dueDate must be a valid ISO 8601 datetime string" })
      .optional(),
    totalPoints: z.number().int().min(1).max(1_000).optional(),
    submissionType: z
      .enum(["TEXT", "FILE", "LINK", "CODE"])
      .optional(),
    allowLateSubmission: z.boolean().optional(),
    latePenalty: z.number().min(0).max(100).optional(),
    attachments: z
      .array(z.string().url("Each attachment must be a valid URL"))
      .max(10)
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

const extendDeadlineSchema = z.object({
  newDueDate: z
    .string()
    .datetime({ message: "newDueDate must be a valid ISO 8601 datetime string" }),
  reason: z.string().max(500).trim().optional(),
});

const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

// ── Router ─────────────────────────────────────────────────────────────────────
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
  validateParams(idSchema),
  validateBody(extendDeadlineSchema),
  Assignments.extendDeadline
);

router.get(
  "/:id",
  validateParams(idSchema),
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
  validateParams(idSchema),
  validateBody(updateAssignmentSchema),
  Assignments.updateAssignment
);

router.delete(
  "/:id",
  requireTeacherOrAdmin,
  validateParams(idSchema),
  Assignments.deleteAssignment
);

export default router;
