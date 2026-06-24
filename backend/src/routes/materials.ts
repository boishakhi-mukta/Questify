import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { verifyJWT } from "@/middleware/auth";
import { requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import * as Materials from "@/controllers/material.controller";

// ── Param schemas ──────────────────────────────────────────────────────────────
const idSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid material ID"),
});

const courseIdParamSchema = z.object({
  courseId: z.string().refine(Types.ObjectId.isValid, "Invalid course ID"),
});

// ── Body schemas ───────────────────────────────────────────────────────────────
const createMaterialSchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200).trim(),
  description: z.string().max(1_000).trim().optional(),
  type: z.enum(["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"], {
    errorMap: () => ({ message: "type must be PDF, VIDEO, DOCUMENT, LINK, IMAGE, or CODE" }),
  }),
  url: z.string().url("url must be a valid URL"),
  fileSize: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
  xpReward: z.number().int().min(0).max(200).optional(),
  isPublished: z.boolean().optional(),
});

const updateMaterialSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200)
      .trim()
      .optional(),
    description: z.string().max(1_000).trim().optional(),
    type: z
      .enum(["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"])
      .optional(),
    url: z.string().url("url must be a valid URL").optional(),
    order: z.number().int().min(0).optional(),
    xpReward: z.number().int().min(0).max(200).optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

// ── Router ─────────────────────────────────────────────────────────────────────
const router = Router();

// All material routes require authentication
router.use(verifyJWT);

// NOTE: /course/:courseId is a static-prefix route and must be declared
// before /:id so Express does not interpret "course" as a material ID.
router.get(
  "/course/:courseId",
  validateParams(courseIdParamSchema),
  validateQuery(paginationQuerySchema),
  Materials.getCourseMaterials
);

// /:id/view has a /view suffix — no conflict with /:id
router.get(
  "/:id/view",
  validateParams(idSchema),
  Materials.viewMaterial
);

router.post(
  "/",
  requireTeacherOrAdmin,
  validateBody(createMaterialSchema),
  Materials.createMaterial
);

router.patch(
  "/:id",
  requireTeacherOrAdmin,
  validateParams(idSchema),
  validateBody(updateMaterialSchema),
  Materials.updateMaterial
);

router.delete(
  "/:id",
  requireTeacherOrAdmin,
  validateParams(idSchema),
  Materials.deleteMaterial
);

export default router;
