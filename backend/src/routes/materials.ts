/**
 * ============================================================================
 * QUESTIFY ROUTES: Materials Router
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Maps URLs for course documents and links.
 * 
 * WHY IT EXISTS:
 * Coordinates material downloads and uploads.
 * 
 * HOW IT WORKS (Technical Overview):
 * Standard controller routing mappings.
 * ============================================================================
 */

import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  idParamSchema,
  courseIdParamSchema,
  createMaterialSchema,
  updateMaterialSchema,
  paginationQuerySchema,
} from "@/utils/validators";
import * as Materials from "@/controllers/material.controller";

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
  validateParams(idParamSchema),
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
  validateParams(idParamSchema),
  validateBody(updateMaterialSchema),
  Materials.updateMaterial
);

router.delete(
  "/:id",
  requireTeacherOrAdmin,
  validateParams(idParamSchema),
  Materials.deleteMaterial
);

export default router;
