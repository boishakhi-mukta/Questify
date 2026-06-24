import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin, requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import * as Courses from "@/controllers/course.controller";

// ── Schemas ────────────────────────────────────────────────────────────────────
const idSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid course ID"),
});

const teacherIdSchema = z
  .string()
  .refine(Types.ObjectId.isValid, "Each teacher must be a valid ID");

const metadataSchema = z
  .object({
    objectives: z.array(z.string().max(500)).optional(),
    prerequisites: z.array(z.string().max(500)).optional(),
    tags: z.array(z.string().max(100)).max(20).optional(),
    syllabus: z.string().max(10_000).optional(),
  })
  .optional();

const createCourseSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(5_000).trim(),
  shortDescription: z.string().max(200).trim().optional(),
  category: z.string().min(1).max(100).trim(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  campus: z.string().min(1).max(100).trim(),
  credits: z.number().int().min(0).max(60).optional(),
  semester: z.string().max(50).optional(),
  teachers: z
    .array(teacherIdSchema)
    .min(1, "At least one teacher is required"),
  estimatedHours: z.number().int().min(1).max(1_000).optional(),
  language: z.string().max(50).optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  maxCapacity: z.number().int().min(1).optional(),
  metadata: metadataSchema,
});

const updateCourseSchema = createCourseSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

const listQuerySchema = z.object({
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  campus: z.string().optional(),
  search: z.string().optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  sort: z
    .enum(["createdAt", "rating", "enrollmentCount", "featured"])
    .optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query "q" is required').max(200),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// ── Router ─────────────────────────────────────────────────────────────────────
const router = Router();

// Public — search must come before /:id to avoid "search" being parsed as an id
router.get("/search", validateQuery(searchQuerySchema), Courses.searchCourses);

// Public
router.get("/", validateQuery(listQuerySchema), Courses.getCourses);
router.get("/:id", validateParams(idSchema), Courses.getCourseById);

// Protected — teacher or admin can create
router.post(
  "/",
  verifyJWT,
  requireTeacherOrAdmin,
  validateBody(createCourseSchema),
  Courses.createCourse
);

// Protected — admin only
router.patch(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idSchema),
  validateBody(updateCourseSchema),
  Courses.updateCourse
);

router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idSchema),
  Courses.deleteCourse
);

export default router;
