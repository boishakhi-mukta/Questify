// ── Roles ──────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ── JWT ────────────────────────────────────────────────────────────────────────
export const JWT = {
  ACCESS_EXPIRES_IN: "24h",
  REFRESH_EXPIRES_IN: "7d",
} as const;

// ── XP Point values ────────────────────────────────────────────────────────────
export const XP_POINTS = {
  ATTENDANCE: 10,
  ASSIGNMENT_SUBMISSION: 25,
  MATERIAL_READ: 15,
  PARTICIPATION: 5,
  QUIZ: 20,
} as const;

export type XPActivity = keyof typeof XP_POINTS;

// ── Pagination ─────────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

// ── Course ─────────────────────────────────────────────────────────────────────
export const COURSE_LEVELS = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;

export type CourseLevel = (typeof COURSE_LEVELS)[keyof typeof COURSE_LEVELS];

// ── Material ───────────────────────────────────────────────────────────────────
export const MATERIAL_TYPES = {
  PDF: "pdf",
  VIDEO: "video",
  LINK: "link",
  SLIDES: "slides",
} as const;

export type MaterialTypeValue = (typeof MATERIAL_TYPES)[keyof typeof MATERIAL_TYPES];

// ── Point types ────────────────────────────────────────────────────────────────
export const POINT_TYPES = {
  ATTENDANCE: "ATTENDANCE",
  ASSIGNMENT_SUBMISSION: "ASSIGNMENT_SUBMISSION",
  MATERIAL_READ: "MATERIAL_READ",
  PARTICIPATION: "PARTICIPATION",
  QUIZ: "QUIZ",
} as const;

export type PointTypeValue = (typeof POINT_TYPES)[keyof typeof POINT_TYPES];

// ── Generic status ─────────────────────────────────────────────────────────────
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export type StatusValue = (typeof STATUS)[keyof typeof STATUS];

// ── Enrollment status ──────────────────────────────────────────────────────────
export const ENROLLMENT_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED",
} as const;

export type EnrollmentStatusValue =
  (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

// ── Error codes ────────────────────────────────────────────────────────────────
export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Domain
  ALREADY_ENROLLED: "ALREADY_ENROLLED",
  NOT_ENROLLED: "NOT_ENROLLED",
  ASSIGNMENT_CLOSED: "ASSIGNMENT_CLOSED",
  DUPLICATE_SUBMISSION: "DUPLICATE_SUBMISSION",
  XP_ALREADY_AWARDED: "XP_ALREADY_AWARDED",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ── HTTP Status codes (convenience) ────────────────────────────────────────────
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

export type HttpStatus = (typeof HTTP)[keyof typeof HTTP];
