/**
 * ============================================================================
 * QUESTIFY UTILITY: Input Zod Validators
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Checks input forms (like signup details or avatar links) to ensure they are valid.
 * 
 * WHY IT EXISTS:
 * Prevents corrupted or malicious inputs from reaching backend databases.
 * 
 * HOW IT WORKS (Technical Overview):
 * Defines schemas with Zod constraints checking properties like lengths and formats.
 * ============================================================================
 */

/**
 * Central Zod validation schemas for all API endpoints.
 * Route files import from here; never define schemas inline in routes.
 */

import { z } from "zod";
import { Types } from "mongoose";

// ══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES — reusable building blocks
// ══════════════════════════════════════════════════════════════════════════════

/** Validates a string is a legal MongoDB ObjectId. */
export const objectIdSchema = z
  .string()
  .refine(Types.ObjectId.isValid, "Must be a valid ObjectId");

/**
 * Password strength rules enforced on every password the user creates.
 * NOTE: the login schema intentionally uses a plain min(1) check — we don't
 * re-validate strength on login because the DB hash is the source of truth.
 */
export const passwordStrengthSchema = z
  .string()
  .min(8,   "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/,                           "Password must contain at least one uppercase letter")
  .regex(/[a-z]/,                           "Password must contain at least one lowercase letter")
  .regex(/\d/,                              "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character"
  );

/** Shared pagination query fields — add to any list query schema via merge/extend. */
export const paginationQuerySchema = z.object({
  page:  z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

/** Shared phone regex reused across profile schemas. */
const phoneRegex = /^\+?[1-9]\d{7,14}$/;

// ══════════════════════════════════════════════════════════════════════════════
// PARAM SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export const courseIdParamSchema = z.object({
  courseId: z.string().refine(Types.ObjectId.isValid, "Invalid course ID"),
});

export const userIdParamSchema = z.object({
  userId: z.string().refine(Types.ObjectId.isValid, "Invalid user ID"),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().refine(Types.ObjectId.isValid, "Invalid student ID"),
});

export const enrollmentIdParamSchema = z.object({
  enrollmentId: z.string().refine(Types.ObjectId.isValid, "Invalid enrollment ID"),
});

export const submissionIdParamSchema = z.object({
  id: z.string().refine(Types.ObjectId.isValid, "Invalid submission ID"),
});

export const assignmentIdParamSchema = z.object({
  assignmentId: z.string().refine(Types.ObjectId.isValid, "Invalid assignment ID"),
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export const registerSchema = z.object({
  email:     z.string({ required_error: "email is required" }).email("Invalid email address").toLowerCase(),
  password:  passwordStrengthSchema,
  firstName: z
    .string({ required_error: "firstName is required" })
    .min(1, "First name must be at least 1 character")
    .max(50, "First name must be at most 50 characters")
    .trim(),
  lastName: z
    .string({ required_error: "lastName is required" })
    .min(1, "Last name must be at least 1 character")
    .max(50, "Last name must be at most 50 characters")
    .trim(),
});

export const loginSchema = z.object({
  email:    z.string({ required_error: "email is required" }).email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: "refreshToken is required" }).min(1, "refreshToken is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     passwordStrengthSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from your current password",
    path:    ["newPassword"],
  });

// ── Profile sub-object shared by auth /profile and user controller ─────────
const profileSubSchema = z
  .object({
    bio:            z.string().max(500, "Bio must be at most 500 characters").trim().optional(),
    location:       z.string().max(100, "Location must be at most 100 characters").trim().optional(),
    phone:          z.string().regex(phoneRegex, "Invalid phone number").optional(),
    educationLevel: z.string().max(100).optional(),
    socialLinks:    z.array(z.string().url("Each social link must be a valid URL")).max(10).optional(),
  })
  .optional();

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(2).max(50).trim().optional(),
    lastName:  z.string().min(2).max(50).trim().optional(),
    avatar:    z.string().url("Avatar must be a valid URL").optional(),
    profile:   profileSubSchema,
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

// ══════════════════════════════════════════════════════════════════════════════
// USER (admin + self-service)
// ══════════════════════════════════════════════════════════════════════════════

/** Used by the admin-facing user route (creates students and teachers only). */
export const createUserSchema = z.object({
  email:     z.string({ required_error: "email is required" }).email("Invalid email address").toLowerCase(),
  firstName: z.string({ required_error: "firstName is required" }).min(1).max(50).trim(),
  lastName:  z.string({ required_error: "lastName is required" }).min(1).max(50).trim(),
  role:      z.enum(["student", "teacher"], {
    errorMap: () => ({ message: 'Role must be "student" or "teacher"' }),
  }),
});

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName:  z.string().min(1).max(50).trim().optional(),
    role:      z.enum(["admin", "teacher", "student"]).optional(),
    isActive:  z.boolean().optional(),
    avatar:    z.string().url("Avatar must be a valid URL").optional(),
    profile:   profileSubSchema,
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export const bulkCreateUserSchema = z.object({
  users: z
    .array(createUserSchema)
    .min(1,   "At least one user is required")
    .max(100, "Maximum 100 users per bulk request"),
});

export const updateAvatarSchema = z.object({
  avatar: z.string({ required_error: "avatar is required" }).url("Avatar must be a valid URL"),
});

export const listUsersQuerySchema = z.object({
  page:     z.coerce.number().int().positive().optional(),
  limit:    z.coerce.number().int().positive().max(100).optional(),
  search:   z.string().max(100).optional(),
  role:     z.enum(["admin", "teacher", "student"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort:     z.enum(["createdAt", "updatedAt", "firstName", "lastName", "email", "role", "lastLogin"]).optional(),
  order:    z.enum(["asc", "desc"]).optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// COURSE
// ══════════════════════════════════════════════════════════════════════════════

const courseMetadataSchema = z
  .object({
    objectives:    z.array(z.string().max(500)).optional(),
    prerequisites: z.array(z.string().max(500)).optional(),
    tags:          z.array(z.string().max(100)).max(20).optional(),
    syllabus:      z.string().max(10_000).optional(),
  })
  .optional();

export const createCourseSchema = z.object({
  title:            z.string({ required_error: "title is required" }).min(3).max(200).trim(),
  description:      z.string({ required_error: "description is required" }).min(10).max(5_000).trim(),
  shortDescription: z.string().max(200).trim().optional(),
  category:         z.string({ required_error: "category is required" }).min(1).max(100).trim(),
  level:            z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    errorMap: () => ({ message: "level must be BEGINNER, INTERMEDIATE, or ADVANCED" }),
  }),
  campus:         z.string({ required_error: "campus is required" }).min(1).max(100).trim(),
  credits:        z.number().int().min(0).max(60).optional(),
  semester:       z.string().max(50).optional(),
  teachers:       z
    .array(z.string().refine(Types.ObjectId.isValid, "Each teacher must be a valid ObjectId"))
    .min(1, "At least one teacher is required"),
  estimatedHours: z.number().int().min(1).max(1_000).optional(),
  language:       z.string().max(50).optional(),
  imageUrl:       z.string().url("imageUrl must be a valid URL").optional(),
  isFeatured:     z.boolean().optional(),
  isPublished:    z.boolean().optional(),
  maxCapacity:    z.number().int().min(1).optional(),
  metadata:       courseMetadataSchema,
});

export const updateCourseSchema = createCourseSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

export const filterCourseSchema = z.object({
  category:   z.string().optional(),
  level:      z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  campus:     z.string().optional(),
  search:     z.string().optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  sort:       z.enum(["createdAt", "rating", "enrollmentCount", "featured"]).optional(),
  page:       z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit:      z.string().regex(/^\d+$/, "limit must be a number").optional(),
});

export const searchCoursesQuerySchema = z.object({
  q:     z.string().min(1, 'Search query "q" is required').max(200),
  page:  z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ENROLLMENT
// ══════════════════════════════════════════════════════════════════════════════

export const selfEnrollSchema = z.object({
  courseId: z
    .string({ required_error: "courseId is required" })
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId"),
});

export const myEnrollmentsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  page:   z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit:  z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export const adminUpdateEnrollmentSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"], {
    required_error: "status is required",
  }),
});

export const listEnrollmentsQuerySchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId")
    .optional(),
  studentId: z
    .string()
    .refine(Types.ObjectId.isValid, "studentId must be a valid ObjectId")
    .optional(),
  semester: z.string().max(50).optional(),
  status:   z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  page:     z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit:    z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export const courseEnrollmentsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  search: z.string().max(100).optional(),
  page:   z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit:  z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export const studentEnrollmentsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  page:   z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit:  z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ASSIGNMENT
// ══════════════════════════════════════════════════════════════════════════════

export const createAssignmentSchema = z.object({
  courseId: z
    .string({ required_error: "courseId is required" })
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId"),
  title: z
    .string({ required_error: "title is required" })
    .min(3,   "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  description: z
    .string({ required_error: "description is required" })
    .min(10,   "Description must be at least 10 characters")
    .max(2_000,"Description must be at most 2 000 characters")
    .trim(),
  instructions: z.string().max(10_000).trim().optional(),
  dueDate: z
    .string({ required_error: "dueDate is required" })
    .datetime({ message: "dueDate must be a valid ISO 8601 datetime string" })
    .refine((d) => new Date(d) > new Date(), {
      message: "dueDate must be in the future",
    }),
  totalPoints:         z.number().int().min(1).max(1_000).optional(),
  submissionType:      z.enum(["TEXT", "FILE", "LINK", "CODE"], {
    errorMap: () => ({ message: "submissionType must be TEXT, FILE, LINK, or CODE" }),
  }),
  allowLateSubmission: z.boolean().optional(),
  latePenalty:         z.number().min(0).max(100).optional(),
  attachments:         z.array(z.string().url("Each attachment must be a valid URL")).max(10).optional(),
});

/**
 * courseId is deliberately excluded from updates — reassigning an assignment
 * would break existing submission foreign keys; delete + recreate instead.
 */
export const updateAssignmentSchema = z
  .object({
    title: z
      .string()
      .min(3,   "Title must be at least 3 characters")
      .max(200, "Title must be at most 200 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .min(10,   "Description must be at least 10 characters")
      .max(2_000,"Description must be at most 2 000 characters")
      .trim()
      .optional(),
    instructions:        z.string().max(10_000).trim().optional(),
    dueDate:             z.string().datetime({ message: "dueDate must be a valid ISO 8601 datetime string" }).optional(),
    totalPoints:         z.number().int().min(1).max(1_000).optional(),
    submissionType:      z.enum(["TEXT", "FILE", "LINK", "CODE"]).optional(),
    allowLateSubmission: z.boolean().optional(),
    latePenalty:         z.number().min(0).max(100).optional(),
    attachments:         z.array(z.string().url("Each attachment must be a valid URL")).max(10).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

export const extendDeadlineSchema = z.object({
  newDueDate: z
    .string({ required_error: "newDueDate is required" })
    .datetime({ message: "newDueDate must be a valid ISO 8601 datetime string" }),
  reason: z.string().max(500).trim().optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// SUBMISSION
// ══════════════════════════════════════════════════════════════════════════════

export const submitAssignmentSchema = z
  .object({
    assignmentId: z
      .string({ required_error: "assignmentId is required" })
      .refine(Types.ObjectId.isValid, "assignmentId must be a valid ObjectId"),
    submissionContent: z
      .string()
      .max(50_000, "submissionContent must be at most 50 000 characters")
      .optional(),
    fileUrl: z.string().url("fileUrl must be a valid URL").optional(),
  })
  .refine(
    (d) => d.submissionContent !== undefined || d.fileUrl !== undefined,
    { message: "Provide either submissionContent or fileUrl" }
  );

export const gradeSubmissionSchema = z.object({
  score: z
    .number({
      required_error:     "score is required",
      invalid_type_error: "score must be a number",
    })
    .min(0,   "score must be at least 0")
    .max(100, "score must be at most 100"),
  feedback: z.string().max(2_000, "feedback must be at most 2 000 characters").optional(),
});

export const submissionsQuerySchema = z.object({
  status: z.enum(["SUBMITTED", "GRADED", "LATE"]).optional(),
  page:   z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit:  z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export const mySubmissionsQuerySchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId")
    .optional(),
  assignmentId: z
    .string()
    .refine(Types.ObjectId.isValid, "assignmentId must be a valid ObjectId")
    .optional(),
  status: z.enum(["SUBMITTED", "GRADED", "LATE"]).optional(),
  page:   z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit:  z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// MATERIAL
// ══════════════════════════════════════════════════════════════════════════════

export const createMaterialSchema = z.object({
  courseId: z
    .string({ required_error: "courseId is required" })
    .refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId"),
  title:       z.string({ required_error: "title is required" }).min(3, "Title must be at least 3 characters").max(200).trim(),
  description: z.string().max(1_000).trim().optional(),
  type:        z.enum(["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"], {
    errorMap: () => ({ message: "type must be PDF, VIDEO, DOCUMENT, LINK, IMAGE, or CODE" }),
  }),
  url:         z.string({ required_error: "url is required" }).url("url must be a valid URL"),
  fileSize:    z.number().int().min(0).optional(),
  order:       z.number().int().min(0).optional(),
  xpReward:    z.number().int().min(0).max(200).optional(),
  isPublished: z.boolean().optional(),
});

export const updateMaterialSchema = z
  .object({
    title:       z.string().min(3, "Title must be at least 3 characters").max(200).trim().optional(),
    description: z.string().max(1_000).trim().optional(),
    type:        z.enum(["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"]).optional(),
    url:         z.string().url("url must be a valid URL").optional(),
    order:       z.number().int().min(0).optional(),
    xpReward:    z.number().int().min(0).max(200).optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — user management
// ══════════════════════════════════════════════════════════════════════════════

/** Admin can create any role including other admins. */
export const adminCreateUserSchema = z.object({
  email:      z.string({ required_error: "email is required" }).email("Must be a valid email"),
  firstName:  z.string({ required_error: "firstName is required" }).min(1).max(50),
  lastName:   z.string({ required_error: "lastName is required" }).min(1).max(50),
  role:       z.enum(["admin", "teacher", "student"], { required_error: "role is required" }),
  department: z.string().max(20).optional(),
});

export const adminUpdateUserSchema = z
  .object({
    firstName:  z.string().min(1).max(50).optional(),
    lastName:   z.string().min(1).max(50).optional(),
    role:       z.enum(["admin", "teacher", "student"]).optional(),
    isActive:   z.boolean().optional(),
    department: z.string().max(20).optional(),
  })
  .refine(
    (d) =>
      d.firstName  !== undefined ||
      d.lastName   !== undefined ||
      d.role       !== undefined ||
      d.isActive   !== undefined ||
      d.department !== undefined,
    { message: "At least one field must be provided" }
  );

export const adminListUsersQuerySchema = z.object({
  page:       z.string().regex(/^\d+$/).optional(),
  limit:      z.string().regex(/^\d+$/).optional(),
  search:     z.string().max(100).optional(),
  role:       z.enum(["admin", "teacher", "student"]).optional(),
  department: z.string().max(20).optional(),
  isActive:   z.enum(["true", "false"]).optional(),
  sort:       z.string().optional(),
  order:      z.enum(["asc", "desc"]).optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — course management
// ══════════════════════════════════════════════════════════════════════════════

/** Admin creates courses; teachers are optionally assigned at creation time. */
export const adminCreateCourseSchema = z.object({
  title:            z.string({ required_error: "title is required" }).min(3).max(200),
  description:      z.string({ required_error: "description is required" }).min(10).max(2_000),
  shortDescription: z.string().max(300).optional(),
  category:         z.string({ required_error: "category is required" }).min(1).max(100),
  level:            z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  campus:           z.string({ required_error: "campus is required" }).min(1).max(100),
  credits:          z.number().min(0).max(60).default(3),
  semester:         z.string().max(50).optional(),
  maxCapacity:      z.number().int().min(1).max(1_000).default(50),
  estimatedHours:   z.number().min(1).max(1_000).default(40),
  facultyIds:       z
    .array(z.string().refine(Types.ObjectId.isValid, "Each facultyId must be a valid ObjectId"))
    .optional(),
});

export const adminUpdateCourseSchema = z
  .object({
    title:            z.string().min(3).max(200).optional(),
    description:      z.string().min(10).max(2_000).optional(),
    shortDescription: z.string().max(300).optional(),
    category:         z.string().max(100).optional(),
    level:            z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    campus:           z.string().max(100).optional(),
    credits:          z.number().min(0).max(60).optional(),
    semester:         z.string().max(50).optional(),
    maxCapacity:      z.number().int().min(1).max(1_000).optional(),
    estimatedHours:   z.number().min(1).max(1_000).optional(),
    isPublished:      z.boolean().optional(),
    isFeatured:       z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export const adminListCoursesQuerySchema = z.object({
  page:        z.string().regex(/^\d+$/).optional(),
  limit:       z.string().regex(/^\d+$/).optional(),
  search:      z.string().max(100).optional(),
  campus:      z.string().max(100).optional(),
  semester:    z.string().max(50).optional(),
  level:       z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  isPublished: z.enum(["true", "false"]).optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — faculty assignment
// ══════════════════════════════════════════════════════════════════════════════

export const assignFacultySchema = z.object({
  facultyIds: z
    .array(z.string().refine(Types.ObjectId.isValid, "Each facultyId must be a valid ObjectId"))
    .min(1, "At least one facultyId is required"),
});

/** assignTeachersSchema — alias used in the prompt spec; identical to assignFacultySchema. */
export const assignTeachersSchema = assignFacultySchema;

export const unassignFacultySchema = z.object({
  facultyId: z
    .string({ required_error: "facultyId is required" })
    .refine(Types.ObjectId.isValid, "facultyId must be a valid ObjectId"),
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — department management
// ══════════════════════════════════════════════════════════════════════════════

export const createDepartmentSchema = z.object({
  name:        z.string({ required_error: "name is required" }).min(1).max(100),
  code:        z.string({ required_error: "code is required" }).min(1).max(20),
  description: z.string().max(500).optional(),
  head:        z.string().refine(Types.ObjectId.isValid, "head must be a valid ObjectId").optional(),
});

export const updateDepartmentSchema = z
  .object({
    name:        z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    head:        z.string().refine(Types.ObjectId.isValid, "head must be a valid ObjectId").optional(),
    isActive:    z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export const listDepartmentsQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — reports
// ══════════════════════════════════════════════════════════════════════════════

export const enrollmentReportQuerySchema = z.object({
  courseId: z.string().refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId").optional(),
  semester: z.string().max(50).optional(),
  status:   z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  format:   z.enum(["json", "csv"]).optional(),
});

export const attendanceReportQuerySchema = z.object({
  courseId:        z.string().refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId").optional(),
  atRiskThreshold: z.string().regex(/^\d+(\.\d+)?$/, "atRiskThreshold must be a number").optional(),
});

export const xpReportQuerySchema = z.object({
  courseId: z.string().refine(Types.ObjectId.isValid, "courseId must be a valid ObjectId").optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

export const xpAnalyticsQuerySchema = z.object({
  courseId: z
    .string()
    .refine(Types.ObjectId.isValid, "Invalid courseId")
    .optional(),
});

// ══════════════════════════════════════════════════════════════════════════════
// INFERRED TYPES
// Derive TypeScript types from schemas so controllers can consume them safely.
// ══════════════════════════════════════════════════════════════════════════════

export type RegisterInput          = z.infer<typeof registerSchema>;
export type LoginInput             = z.infer<typeof loginSchema>;
export type ChangePasswordInput    = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput     = z.infer<typeof updateProfileSchema>;

export type CreateUserInput        = z.infer<typeof createUserSchema>;
export type UpdateUserInput        = z.infer<typeof updateUserSchema>;
export type BulkCreateUserInput    = z.infer<typeof bulkCreateUserSchema>;

export type CreateCourseInput      = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput      = z.infer<typeof updateCourseSchema>;
export type FilterCourseInput      = z.infer<typeof filterCourseSchema>;

export type SelfEnrollInput        = z.infer<typeof selfEnrollSchema>;

export type CreateAssignmentInput  = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput  = z.infer<typeof updateAssignmentSchema>;
export type ExtendDeadlineInput    = z.infer<typeof extendDeadlineSchema>;

export type SubmitAssignmentInput  = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput   = z.infer<typeof gradeSubmissionSchema>;

export type CreateMaterialInput    = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput    = z.infer<typeof updateMaterialSchema>;

export type AdminCreateUserInput   = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserInput   = z.infer<typeof adminUpdateUserSchema>;
export type AdminCreateCourseInput = z.infer<typeof adminCreateCourseSchema>;
export type AdminUpdateCourseInput = z.infer<typeof adminUpdateCourseSchema>;
export type AssignFacultyInput     = z.infer<typeof assignFacultySchema>;
export type UnassignFacultyInput   = z.infer<typeof unassignFacultySchema>;
export type CreateDepartmentInput  = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput  = z.infer<typeof updateDepartmentSchema>;
