/**
 * ============================================================================
 * QUESTIFY TYPES: API Response Interfaces
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Sets structural rules for server responses.
 * 
 * WHY IT EXISTS:
 * Guides developers during API data extraction tasks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports TypeScript schemas defining response formats.
 * ============================================================================
 */

/**
 * Frontend type definitions that mirror the Questify backend API contract.
 * All shapes here correspond to what the backend's `sendSuccess` /
 * `sendPaginated` / `sendError` functions emit.
 */

// ── Re-export auth types so callers have a single import point ────────────────
export type { AuthUser, LoginResponse, LoginResult, LoginError } from "./auth";

// ══════════════════════════════════════════════════════════════════════════════
// ENVELOPE TYPES — the outer wrapper every backend response uses
// ══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data:    T;
  timestamp: string;
}

export interface PaginationMeta {
  page:  number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success:    true;
  message:    string;
  data:       T[];
  pagination: PaginationMeta;
  timestamp:  string;
}

/** Shape of every error body the backend sends. */
export interface ApiErrorBody {
  success: false;
  error: {
    code:       string;
    message:    string;
    statusCode: number;
    timestamp:  string;
    requestId:  string;
    details?:   string[];
    stack?:     string;
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE ERROR CLASS
// ══════════════════════════════════════════════════════════════════════════════

export class ApiError extends Error {
  public readonly status:  number;
  public readonly code:    string;
  public readonly details: string[];

  constructor(
    message: string,
    status:  number,
    code    = "UNKNOWN_ERROR",
    details: string[] = []
  ) {
    super(message);
    this.name    = "ApiError";
    this.status  = status;
    this.code    = code;
    this.details = details;
  }

  get isUnauthorized()  { return this.status === 401; }
  get isForbidden()     { return this.status === 403; }
  get isNotFound()      { return this.status === 404; }
  get isValidation()    { return this.status === 422; }
  get isConflict()      { return this.status === 409; }
  get isRateLimit()     { return this.status === 429; }
  get isServerError()   { return this.status >= 500; }
  get isTokenExpired()  { return this.code === "TOKEN_EXPIRED"; }
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — USER
// ══════════════════════════════════════════════════════════════════════════════

export type UserRole = "admin" | "teacher" | "student";

export interface UserProfile {
  bio?:            string;
  location?:       string;
  phone?:          string;
  socialLinks:     string[];
  educationLevel?: string;
  department?:     string;
}

export interface User {
  _id:                    string;
  email:                  string;
  firstName:              string;
  lastName:               string;
  fullName:               string;
  role:                   UserRole;
  avatar?:                string;
  profile:                UserProfile;
  isActive:               boolean;
  emailVerified:          boolean;
  lastLogin?:             string;
  requiresPasswordChange: boolean;
  createdAt:              string;
  updatedAt:              string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — COURSE
// ══════════════════════════════════════════════════════════════════════════════

export type CourseLevel = "BACHELOR" | "MASTERS";

export interface CourseMetadata {
  objectives?:    string[];
  prerequisites?: string[];
  tags?:          string[];
  syllabus?:      string;
}

export interface Course {
  _id:              string;
  title:            string;
  description:      string;
  shortDescription?: string;
  category:         string;
  level:            CourseLevel;
  campus:           string;
  credits:          number;
  semester?:        string;
  language?:        string;
  imageUrl?:        string;
  teachers:         string[] | Pick<User, "_id" | "firstName" | "lastName" | "avatar">[];
  enrollmentCount:  number;
  maxCapacity:      number;
  estimatedHours:   number;
  averageRating:    number;
  totalReviews:     number;
  isPublished:      boolean;
  isFeatured:       boolean;
  metadata?:        CourseMetadata;
  createdAt:        string;
  updatedAt:        string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — ENROLLMENT
// ══════════════════════════════════════════════════════════════════════════════

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

export interface Enrollment {
  _id:               string;
  studentId:         string | User;
  courseId:          string | Course;
  status:            EnrollmentStatus;
  semester?:         string;
  enrolledAt:        string;
  completedAt?:      string;
  progressPercentage: number;
  totalXpEarned:     number;
  createdAt:         string;
  updatedAt:         string;
}

/** Enrollment with fully populated course (the most common shape returned). */
export interface EnrollmentWithCourse extends Omit<Enrollment, "courseId"> {
  courseId: Course;
}

/** Enrollment with fully populated student (admin views). */
export interface EnrollmentWithStudent extends Omit<Enrollment, "studentId"> {
  studentId: Pick<User, "_id" | "firstName" | "lastName" | "email" | "avatar">;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — DEPARTMENT
// ══════════════════════════════════════════════════════════════════════════════

export interface Department {
  _id:          string;
  name:         string;
  code:         string;
  description?: string;
  head?:        string | Pick<User, "_id" | "firstName" | "lastName">;
  isActive:     boolean;
  createdAt:    string;
  updatedAt:    string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — ASSIGNMENT
// ══════════════════════════════════════════════════════════════════════════════

export type SubmissionType = "TEXT" | "FILE" | "LINK" | "CODE";

export interface Assignment {
  _id:                 string;
  courseId:            string;
  title:               string;
  description:         string;
  instructions?:       string;
  dueDate:             string;
  totalPoints:         number;
  submissionType:      SubmissionType;
  allowLateSubmission: boolean;
  latePenalty:         number;
  attachments:         string[];
  createdAt:           string;
  updatedAt:           string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — SUBMISSION
// ══════════════════════════════════════════════════════════════════════════════

export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE";

export interface Submission {
  _id:               string;
  assignmentId:      string | Assignment;
  courseId:          string;
  studentId:         string | Pick<User, "_id" | "firstName" | "lastName" | "email">;
  status:            SubmissionStatus;
  submissionContent?: string;
  fileUrl?:          string;
  score?:            number;
  feedback?:         string;
  gradedAt?:         string;
  submittedAt:       string;
  createdAt:         string;
  updatedAt:         string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — MATERIAL
// ══════════════════════════════════════════════════════════════════════════════

export type MaterialType = "PDF" | "VIDEO" | "DOCUMENT" | "LINK" | "IMAGE" | "CODE";

export interface Material {
  _id:         string;
  courseId:    string;
  title:       string;
  description?: string;
  type:        MaterialType;
  url:         string;
  fileSize?:   number;
  order:       number;
  xpReward:    number;
  isPublished: boolean;
  viewCount:   number;
  createdAt:   string;
  updatedAt:   string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN — XP
// ══════════════════════════════════════════════════════════════════════════════

export type XPActivityType =
  | "ATTENDANCE"
  | "ASSIGNMENT_SUBMISSION"
  | "MATERIAL_READ"
  | "PARTICIPATION"
  | "QUIZ";

export interface XPEntry {
  _id:        string;
  studentId:  string;
  courseId?:  string;
  type:       XPActivityType;
  points:     number;
  description: string;
  metadata?: {
    submissionId?:  string;
    assignmentId?:  string;
    materialId?:    string;
    attendanceId?:  string;
  };
  earnedAt:   string;
  createdAt:  string;
}

export interface LeaderboardEntry {
  rank:      number;
  studentId: string;
  name:      string;
  email?:    string;
  avatar?:   string;
  totalXP:   number;
  courseCount?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS — response shapes for each analytics endpoint
// ══════════════════════════════════════════════════════════════════════════════

export interface MonthlyCount {
  year:  number;
  month: number;
  count: number;
}

export interface MonthlyXP {
  year:        number;
  month:       number;
  totalPoints: number;
  events:      number;
}

export interface CourseAnalyticsResponse {
  course: Pick<Course, "_id" | "title" | "campus"> & { semester?: string };
  enrollments: {
    total:         number;
    byStatus:      Record<string, number>;
    completionRate: number;
    dropoutRate:   number;
    trend:         MonthlyCount[];
  };
  performance: {
    avgScore:    number;
    totalGraded: number;
  };
  topStudents: Array<{
    _id:               string;
    totalXpEarned:     number;
    progressPercentage: number;
    status:            EnrollmentStatus;
    studentId:         Pick<User, "_id" | "firstName" | "lastName" | "email" | "avatar">;
  }>;
  engagement: {
    attendanceRate: number;
    submissionRate: number;
    xpByActivity:   Array<{ type: XPActivityType; totalPoints: number; events: number }>;
  };
}

export interface UserAnalyticsResponse {
  user?: Pick<User, "_id" | "firstName" | "lastName" | "email" | "role">;
  enrollmentHistory:   EnrollmentWithCourse[];
  enrollmentSummary:   { total: number; active: number; completed: number; dropped: number };
  xpProgressByMonth:   MonthlyXP[];
  favoriteCategories:  Array<{ category: string; count: number }>;
  learningStreak:      number;
  totalXP:             number;
  submissions: {
    total:    number;
    graded:   number;
    avgScore: number;
  };
}

export interface EnrollmentAnalyticsResponse {
  overview: {
    total:                number;
    byStatus:             Record<string, number>;
    overallCompletionRate: number;
    dropoutRate:          number;
    avgTimeToCompletion:  { avgDays: number; sampleSize: number };
  };
  monthlyTrend:            MonthlyCount[];
  completionRateByCourse:  Array<{
    courseId:       string;
    courseTitle:    string;
    campus:         string;
    total:          number;
    completed:      number;
    completionRate: number;
  }>;
  semesterBreakdown: Array<{ semester: string; count: number }>;
}

export interface XPAnalyticsResponse {
  scope: string | { courseId: string };
  summary: { totalXP: number; totalEvents: number };
  totalXpAwardedByType:   Array<{ type: XPActivityType; totalPoints: number; events: number }>;
  mostActiveStudents:     LeaderboardEntry[];
  xpDistributionByCourse: Array<{ courseId: string; courseTitle: string; totalPoints: number; students: number }>;
  xpTrend:                MonthlyXP[];
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

export interface DashboardStats {
  totalUsers:       number;
  totalCourses:     number;
  totalEnrollments: number;
  activeStudents:   number;
}

export interface DashboardAnalytics {
  enrollmentTrend:  MonthlyCount[];
  topCourses:       Array<{ courseId: string; title: string; enrollmentCount: number }>;
  xpByType:         Array<{ type: XPActivityType; total: number }>;
  campusBreakdown:  Array<{ campus: string; courses: number; students: number }>;
  submissionTrend:  MonthlyCount[];
}
