/**
 * ============================================================================
 * QUESTIFY ROUTES: Admin Router
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Configures global control options for administrators.
 * 
 * WHY IT EXISTS:
 * Restricts access to administrative endpoints.
 * 
 * HOW IT WORKS (Technical Overview):
 * Enforces admin role credentials check before forwarding requests.
 * ============================================================================
 */

import { Router } from "express";
import { verifyJWT } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/rbac";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  idParamSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminListUsersQuerySchema,
  adminCreateCourseSchema,
  adminUpdateCourseSchema,
  adminListCoursesQuerySchema,
  assignFacultySchema,
  unassignFacultySchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsQuerySchema,
  enrollmentReportQuerySchema,
  attendanceReportQuerySchema,
  xpReportQuerySchema,
} from "@/utils/validators";
import * as Admin from "@/controllers/admin.controller";

const router = Router();

// ── Public endpoint (no auth required) ────────────────────────────────────────
router.get("/stats", Admin.getStats);

// ── All routes below require admin auth ───────────────────────────────────────
router.use(verifyJWT, requireAdmin);

// ── User management ────────────────────────────────────────────────────────────
router.post(
  "/users",
  validateBody(adminCreateUserSchema),
  Admin.adminCreateUser
);

router.get(
  "/users",
  validateQuery(adminListUsersQuerySchema),
  Admin.adminListUsers
);

router.patch(
  "/users/:id",
  validateParams(idParamSchema),
  validateBody(adminUpdateUserSchema),
  Admin.adminUpdateUser
);

router.delete(
  "/users/:id",
  validateParams(idParamSchema),
  Admin.adminSoftDeleteUser
);

// NOTE: /users/:id/reset-password is a POST — no method conflict with PATCH/DELETE
router.post(
  "/users/:id/reset-password",
  validateParams(idParamSchema),
  Admin.adminResetPassword
);

// ── Course management ──────────────────────────────────────────────────────────
router.post(
  "/courses",
  validateBody(adminCreateCourseSchema),
  Admin.adminCreateCourse
);

router.get(
  "/courses",
  validateQuery(adminListCoursesQuerySchema),
  Admin.adminListCourses
);

router.patch(
  "/courses/:id",
  validateParams(idParamSchema),
  validateBody(adminUpdateCourseSchema),
  Admin.adminUpdateCourse
);

router.delete(
  "/courses/:id",
  validateParams(idParamSchema),
  Admin.adminSoftDeleteCourse
);

// Sub-resource routes for a course — declared with full path to avoid Express
// interpreting "assign-faculty" as the :id param in /:id
router.post(
  "/courses/:id/assign-faculty",
  validateParams(idParamSchema),
  validateBody(assignFacultySchema),
  Admin.assignFaculty
);

router.post(
  "/courses/:id/unassign-faculty",
  validateParams(idParamSchema),
  validateBody(unassignFacultySchema),
  Admin.unassignFaculty
);

// ── Department management ──────────────────────────────────────────────────────
router.post(
  "/departments",
  validateBody(createDepartmentSchema),
  Admin.createDepartment
);

router.get(
  "/departments",
  validateQuery(listDepartmentsQuerySchema),
  Admin.listDepartments
);

router.patch(
  "/departments/:id",
  validateParams(idParamSchema),
  validateBody(updateDepartmentSchema),
  Admin.updateDepartment
);

// Sub-resource views — must be declared before /:id
router.get(
  "/departments/:id/courses",
  validateParams(idParamSchema),
  Admin.getDepartmentCourses
);

router.get(
  "/departments/:id/students",
  validateParams(idParamSchema),
  Admin.getDepartmentStudents
);

// ── Dashboard ──────────────────────────────────────────────────────────────────
// NOTE: /dashboard/analytics must precede /dashboard so Express evaluates the
// more specific path first.
router.get("/dashboard/analytics", Admin.getDashboardAnalytics);
router.get("/dashboard",           Admin.getDashboard);

// ── Reports ────────────────────────────────────────────────────────────────────
router.get(
  "/reports/enrollment",
  validateQuery(enrollmentReportQuerySchema),
  Admin.enrollmentReport
);

router.get(
  "/reports/attendance",
  validateQuery(attendanceReportQuerySchema),
  Admin.attendanceReport
);

router.get(
  "/reports/xp",
  validateQuery(xpReportQuerySchema),
  Admin.xpReport
);

router.get("/reports/user-activity", Admin.userActivityReport);

export default router;
