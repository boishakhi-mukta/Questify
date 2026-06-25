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
