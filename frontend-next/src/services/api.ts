/**
 * ============================================================================
 * QUESTIFY SERVICE: HTTP API Client
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The central adapter that routes requests from the browser to the backend database.
 * 
 * WHY IT EXISTS:
 * Bundles fetch credentials and access tokens, saving duplicate code.
 * 
 * HOW IT WORKS (Technical Overview):
 * Extends HTTP client utilities with custom authorization headers.
 * ============================================================================
 */

import { get, post, patch, del, getPaginated } from "@/utils/http-client";
import type {
  Course,
  User,
  Enrollment,
  EnrollmentWithCourse,
  Material,
  Assignment,
  Submission,
  LeaderboardEntry,
} from "@/types/api-response";

// ── Course filters sent to GET /courses ───────────────────────────────────────

export interface CourseListParams {
  search?:     string;
  category?:   string;
  level?:      string;
  campus?:     string;
  isFeatured?: boolean;
  sort?:       "createdAt" | "rating" | "enrollmentCount" | "featured";
  page?:       number;
  limit?:      number;
}

// ── Courses ───────────────────────────────────────────────────────────────────

export const coursesApi = {
  list: (params?: CourseListParams) =>
    getPaginated<Course>("/courses", params as Record<string, unknown>),

  getById: (id: string) =>
    get<{ course: Course }>(`/courses/${id}`),
};

// ── Enrollments ───────────────────────────────────────────────────────────────

export const enrollmentsApi = {
  mine: () =>
    get<EnrollmentWithCourse[]>("/my-enrollments"),

  enroll: (courseId: string) =>
    post<Enrollment>("/enrollments", { courseId }),

  unenroll: (enrollmentId: string) =>
    del<void>(`/my-enrollments/${enrollmentId}`),
};

// ── Materials ─────────────────────────────────────────────────────────────────

export const materialsApi = {
  byCourse: (courseId: string) =>
    get<Material[]>("/materials", { courseId }),
};

// ── Assignments ───────────────────────────────────────────────────────────────

export interface SubmitAssignmentPayload {
  assignmentId: string;
  courseId:     string;
  submissionContent?: string;
  fileUrl?:     string;
}

export const assignmentsApi = {
  byCourse: (courseId: string) =>
    get<Assignment[]>("/assignments", { courseId }),

  submit: (payload: SubmitAssignmentPayload) =>
    post<Submission>("/submissions", payload),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardApi = {
  global: (params?: { timeframe?: string; limit?: number }) =>
    get<LeaderboardEntry[]>("/analytics/leaderboard", params as Record<string, unknown>),
};

// ── Admin — Users ─────────────────────────────────────────────────────────────

export interface AdminListUsersParams {
  page?:   number;
  limit?:  number;
  search?: string;
  role?:   "admin" | "teacher" | "student";
  sort?:   string;
}

export interface AdminCreateUserPayload {
  firstName:   string;
  lastName:    string;
  email:       string;
  role:        "teacher" | "student";
  department?: string;
}

export interface AdminUpdateUserPayload {
  firstName?:  string;
  lastName?:   string;
  role?:       "admin" | "teacher" | "student";
  isActive?:   boolean;
  department?: string;
}

export const adminUsersApi = {
  list: (params?: AdminListUsersParams) =>
    getPaginated<User>("/admin/users", params as Record<string, unknown>),

  create: (payload: AdminCreateUserPayload) =>
    post<{ user: User; tempPassword: string }>("/admin/users", payload),

  update: (id: string, payload: AdminUpdateUserPayload) =>
    patch<{ user: User }>(`/admin/users/${id}`, payload),

  remove: (id: string) =>
    del<void>(`/admin/users/${id}`),

  resetPassword: (id: string) =>
    post<{ tempPassword: string }>(`/admin/users/${id}/reset-password`, {}),
};

// ── Admin — Courses ───────────────────────────────────────────────────────────

export interface AdminListCoursesParams {
  page?:    number;
  limit?:   number;
  search?:  string;
  campus?:  string;
  level?:   string;
  sort?:    string;
}

export interface AdminCreateCoursePayload {
  title:            string;
  description:      string;
  shortDescription?: string;
  category:         string;
  level:            "BACHELOR" | "MASTERS";
  campus:           string;
  credits:          number;
  semester?:        string;
  maxCapacity?:     number;
  estimatedHours?:  number;
}

export interface AdminUpdateCoursePayload {
  title?:           string;
  description?:     string;
  shortDescription?: string;
  category?:        string;
  level?:           "BACHELOR" | "MASTERS";
  campus?:          string;
  credits?:         number;
  semester?:        string;
  maxCapacity?:     number;
  estimatedHours?:  number;
  isPublished?:     boolean;
}

export const adminCoursesApi = {
  list: (params?: AdminListCoursesParams) =>
    getPaginated<Course>("/admin/courses", params as Record<string, unknown>),

  create: (payload: AdminCreateCoursePayload) =>
    post<{ course: Course }>("/admin/courses", payload),

  update: (id: string, payload: AdminUpdateCoursePayload) =>
    patch<{ course: Course }>(`/admin/courses/${id}`, payload),

  remove: (id: string) =>
    del<void>(`/admin/courses/${id}`),
};

// ── Admin — Stats ─────────────────────────────────────────────────────────────

export interface AdminStats {
  totalStudents:      number;
  totalTeachers:      number;
  totalCourses:       number;
  totalXPDistributed: number;
}

export const adminStatsApi = {
  get: () => get<AdminStats>("/admin/stats"),
};
