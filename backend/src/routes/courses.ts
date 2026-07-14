/**
 * ============================================================================
 * QUESTIFY ROUTES: Courses Router
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Maps courses catalog URLs.
 * 
 * WHY IT EXISTS:
 * Gateway to fetch course catalogs.
 * 
 * HOW IT WORKS (Technical Overview):
 * Sets permission checks before letting users read/write course details.
 * ============================================================================
 */

import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin, requireTeacherOrAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  idParamSchema,
  createCourseSchema,
  updateCourseSchema,
  filterCourseSchema,
  searchCoursesQuerySchema,
} from "@/utils/validators";
import * as Courses from "@/controllers/course.controller";

const router = Router();

// Public — search must come before /:id to avoid "search" being parsed as an id
router.get("/search", validateQuery(searchCoursesQuerySchema), Courses.searchCourses);

// Public
router.get("/",    validateQuery(filterCourseSchema), Courses.getCourses);
router.get("/:id", validateParams(idParamSchema),      Courses.getCourseById);

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
  validateParams(idParamSchema),
  validateBody(updateCourseSchema),
  Courses.updateCourse
);

router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  validateParams(idParamSchema),
  Courses.deleteCourse
);

export default router;
