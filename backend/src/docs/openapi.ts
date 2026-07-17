/**
 * OpenAPI 3.0.3 specification for Questify — Gamified LMS API.
 * Served at /api-docs via swagger-ui-express.
 */

// ─── Shared primitives ─────────────────────────────────────────────────────────

const objectId = { type: "string", pattern: "^[a-f\\d]{24}$", example: "665f1a2b3c4d5e6f7a8b9c0d" };
const isoDate  = { type: "string", format: "date-time", example: "2025-09-01T08:00:00.000Z" };
const pageNum  = { type: "integer", minimum: 1, default: 1, description: "Page number" };
const limitNum = { type: "integer", minimum: 1, maximum: 100, default: 20, description: "Items per page" };

// ─── Reusable parameter definitions ───────────────────────────────────────────

const pathId       = { name: "id",           in: "path" as const, required: true, schema: objectId, description: "MongoDB ObjectId" };
const pathCourseId = { name: "courseId",     in: "path" as const, required: true, schema: objectId, description: "Course ObjectId" };
const pathUserId   = { name: "userId",       in: "path" as const, required: true, schema: objectId, description: "User ObjectId" };
const pathStudentId= { name: "studentId",    in: "path" as const, required: true, schema: objectId, description: "Student ObjectId" };
const pathEnrollId = { name: "enrollmentId", in: "path" as const, required: true, schema: objectId, description: "Enrollment ObjectId" };
const pathAssignId = { name: "assignmentId", in: "path" as const, required: true, schema: objectId, description: "Assignment ObjectId" };

const qPage  = { name: "page",  in: "query" as const, schema: pageNum };
const qLimit = { name: "limit", in: "query" as const, schema: limitNum };

// ─── Schema definitions ────────────────────────────────────────────────────────

const schemas = {

  // ── Envelopes ────────────────────────────────────────────────────────────────
  ApiSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string",  example: "Operation successful" },
      data:    { description: "Response payload (shape varies per endpoint)" },
    },
    required: ["success", "message"],
  },

  Pagination: {
    type: "object",
    properties: {
      page:  { type: "integer", example: 1 },
      limit: { type: "integer", example: 20 },
      total: { type: "integer", example: 142 },
      pages: { type: "integer", example: 8 },
    },
    required: ["page", "limit", "total", "pages"],
  },

  ApiError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code:      { type: "string",  example: "VALIDATION_ERROR" },
          message:   { type: "string",  example: "Invalid request body" },
          statusCode:{ type: "integer", example: 422 },
          timestamp: { type: "string",  format: "date-time" },
          requestId: { type: "string",  example: "req_1a2b3c4d" },
          details:   { type: "array", items: { type: "string" }, description: "Field-level error messages" },
        },
        required: ["code", "message", "statusCode", "timestamp", "requestId"],
      },
    },
    required: ["success", "error"],
  },

  // ── Auth ─────────────────────────────────────────────────────────────────────
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email:    { type: "string", format: "email", example: "alice.johnson@student.edu" },
      password: { type: "string", minLength: 8,    example: "StudentPass123!" },
    },
  },

  AuthTokens: {
    type: "object",
    properties: {
      accessToken:  { type: "string", description: "Short-lived JWT (7d)" },
      refreshToken: { type: "string", description: "Long-lived refresh JWT (30d)" },
      expiresIn:    { type: "string", example: "7d" },
    },
    required: ["accessToken", "refreshToken", "expiresIn"],
  },

  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: { type: "string", minLength: 8, example: "OldPass123!" },
      newPassword:     { type: "string", minLength: 8, example: "NewPass456@" },
    },
  },

  UpdateProfileRequest: {
    type: "object",
    properties: {
      firstName: { type: "string", minLength: 1, maxLength: 50 },
      lastName:  { type: "string", minLength: 1, maxLength: 50 },
      bio:       { type: "string", maxLength: 500 },
      location:  { type: "string", maxLength: 100 },
      phone:     { type: "string", example: "+4791234567" },
    },
  },

  // ── User ─────────────────────────────────────────────────────────────────────
  UserProfile: {
    type: "object",
    properties: {
      bio:            { type: "string" },
      location:       { type: "string" },
      phone:          { type: "string" },
      socialLinks:    { type: "array", items: { type: "string", format: "uri" } },
      educationLevel: { type: "string" },
      department:     { type: "string", example: "CS" },
    },
  },

  User: {
    type: "object",
    properties: {
      _id:                    objectId,
      email:                  { type: "string", format: "email" },
      firstName:              { type: "string" },
      lastName:               { type: "string" },
      fullName:               { type: "string", readOnly: true },
      avatar:                 { type: "string", format: "uri" },
      role:                   { type: "string", enum: ["admin", "teacher", "student"] },
      profile:                { $ref: "#/components/schemas/UserProfile" },
      isActive:               { type: "boolean" },
      emailVerified:          { type: "boolean" },
      requiresPasswordChange: { type: "boolean" },
      lastLogin:              { ...isoDate, nullable: true },
      createdAt:              isoDate,
      updatedAt:              isoDate,
    },
    required: ["_id", "email", "firstName", "lastName", "role"],
  },

  CreateUserRequest: {
    type: "object",
    required: ["email", "firstName", "lastName", "role"],
    properties: {
      email:      { type: "string", format: "email" },
      firstName:  { type: "string", minLength: 1, maxLength: 50 },
      lastName:   { type: "string", minLength: 1, maxLength: 50 },
      role:       { type: "string", enum: ["admin", "teacher", "student"] },
      department: { type: "string", maxLength: 20, example: "CS" },
    },
  },

  CreateUserResponse: {
    type: "object",
    properties: {
      user:         { $ref: "#/components/schemas/User" },
      tempPassword: { type: "string", description: "One-time password for manual sharing — no email is sent" },
    },
    required: ["user", "tempPassword"],
  },

  // ── Course ────────────────────────────────────────────────────────────────────
  CourseMetadata: {
    type: "object",
    properties: {
      objectives:    { type: "array", items: { type: "string" } },
      prerequisites: { type: "array", items: { type: "string" } },
      tags:          { type: "array", items: { type: "string" } },
      syllabus:      { type: "string" },
    },
  },

  Course: {
    type: "object",
    properties: {
      _id:               objectId,
      title:             { type: "string" },
      description:       { type: "string" },
      shortDescription:  { type: "string" },
      category:          { type: "string" },
      level:             { type: "string", enum: ["BACHELOR", "MASTERS"] },
      campus:            { type: "string" },
      credits:           { type: "integer" },
      semester:          { type: "string" },
      teachers:          { type: "array", items: objectId },
      estimatedHours:    { type: "integer" },
      language:          { type: "string", default: "English" },
      imageUrl:          { type: "string", format: "uri" },
      isFeatured:        { type: "boolean" },
      isPublished:       { type: "boolean" },
      enrollmentCount:   { type: "integer" },
      maxCapacity:       { type: "integer" },
      enrollmentPercentage: { type: "integer", readOnly: true, description: "Virtual: (enrollmentCount / maxCapacity) × 100" },
      averageRating:     { type: "number" },
      totalReviews:      { type: "integer" },
      metadata:          { $ref: "#/components/schemas/CourseMetadata" },
      createdAt:         isoDate,
      updatedAt:         isoDate,
    },
    required: ["_id", "title", "description", "category", "level", "campus"],
  },

  CreateCourseRequest: {
    type: "object",
    required: ["title", "description", "category", "level", "campus", "teachers"],
    properties: {
      title:          { type: "string", minLength: 3, maxLength: 200 },
      description:    { type: "string", minLength: 10, maxLength: 5000 },
      category:       { type: "string" },
      level:          { type: "string", enum: ["BACHELOR", "MASTERS"] },
      campus:         { type: "string" },
      credits:        { type: "integer", minimum: 0, maximum: 60, default: 3 },
      semester:       { type: "string" },
      teachers:       { type: "array", items: objectId, minItems: 1 },
      imageUrl:       { type: "string", format: "uri" },
      estimatedHours: { type: "integer", minimum: 1, maximum: 1000 },
      maxCapacity:    { type: "integer", minimum: 1 },
      metadata:       { $ref: "#/components/schemas/CourseMetadata" },
    },
  },

  // ── Enrollment ────────────────────────────────────────────────────────────────
  Enrollment: {
    type: "object",
    properties: {
      _id:                objectId,
      studentId:          objectId,
      courseId:           objectId,
      status:             { type: "string", enum: ["ACTIVE", "COMPLETED", "DROPPED"] },
      semester:           { type: "string" },
      enrolledAt:         isoDate,
      completedAt:        { ...isoDate, nullable: true },
      totalXpEarned:      { type: "integer" },
      progressPercentage: { type: "integer", minimum: 0, maximum: 100 },
      lastAccessedAt:     isoDate,
      certificateIssued:  { type: "boolean" },
      certificateUrl:     { type: "string", format: "uri", nullable: true },
      notes:              { type: "string", nullable: true },
      createdAt:          isoDate,
      updatedAt:          isoDate,
    },
    required: ["_id", "studentId", "courseId", "status"],
  },

  SelfEnrollRequest: {
    type: "object",
    required: ["courseId"],
    properties: {
      courseId: { ...objectId, description: "ID of the course to enrol in" },
    },
  },

  // ── Material ─────────────────────────────────────────────────────────────────
  Material: {
    type: "object",
    properties: {
      _id:         objectId,
      courseId:    objectId,
      title:       { type: "string" },
      description: { type: "string" },
      type:        { type: "string", enum: ["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"] },
      url:         { type: "string", format: "uri" },
      fileSize:    { type: "integer", description: "File size in bytes; 0 for external links" },
      uploadedBy:  objectId,
      order:       { type: "integer" },
      xpReward:    { type: "integer", description: "XP awarded when a student reads this material" },
      isPublished: { type: "boolean" },
      views:       { type: "integer" },
      createdAt:   isoDate,
      updatedAt:   isoDate,
    },
    required: ["_id", "courseId", "title", "type", "url"],
  },

  CreateMaterialRequest: {
    type: "object",
    required: ["courseId", "title", "type", "url"],
    properties: {
      courseId:    { ...objectId },
      title:       { type: "string", minLength: 3, maxLength: 200 },
      description: { type: "string", maxLength: 1000 },
      type:        { type: "string", enum: ["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"] },
      url:         { type: "string", format: "uri" },
      fileSize:    { type: "integer", minimum: 0 },
      order:       { type: "integer", minimum: 0 },
      xpReward:    { type: "integer", minimum: 0, default: 15 },
    },
  },

  // ── Assignment ────────────────────────────────────────────────────────────────
  Assignment: {
    type: "object",
    properties: {
      _id:                 objectId,
      courseId:            objectId,
      title:               { type: "string" },
      description:         { type: "string" },
      instructions:        { type: "string" },
      dueDate:             isoDate,
      totalPoints:         { type: "integer" },
      submissionType:      { type: "string", enum: ["TEXT", "FILE", "LINK", "CODE"] },
      allowLateSubmission: { type: "boolean" },
      latePenalty:         { type: "integer", description: "Late-submission penalty as a percentage (0–100)" },
      attachments:         { type: "array", items: { type: "string", format: "uri" } },
      createdAt:           isoDate,
      updatedAt:           isoDate,
    },
    required: ["_id", "courseId", "title", "description", "dueDate", "submissionType"],
  },

  CreateAssignmentRequest: {
    type: "object",
    required: ["courseId", "title", "description", "dueDate", "submissionType"],
    properties: {
      courseId:            { ...objectId },
      title:               { type: "string", minLength: 3, maxLength: 200 },
      description:         { type: "string", minLength: 10, maxLength: 2000 },
      instructions:        { type: "string", maxLength: 10000 },
      dueDate:             { type: "string", format: "date-time", description: "Must be a future date" },
      totalPoints:         { type: "integer", minimum: 1, maximum: 1000, default: 100 },
      submissionType:      { type: "string", enum: ["TEXT", "FILE", "LINK", "CODE"] },
      allowLateSubmission: { type: "boolean", default: false },
      latePenalty:         { type: "integer", minimum: 0, maximum: 100, default: 10 },
    },
  },

  ExtendDeadlineRequest: {
    type: "object",
    required: ["newDueDate"],
    properties: {
      newDueDate: { type: "string", format: "date-time" },
      reason:     { type: "string", maxLength: 500 },
    },
  },

  // ── Submission ────────────────────────────────────────────────────────────────
  Submission: {
    type: "object",
    properties: {
      _id:               objectId,
      assignmentId:      objectId,
      studentId:         objectId,
      courseId:          objectId,
      submissionContent: { type: "string", nullable: true },
      fileUrl:           { type: "string", format: "uri", nullable: true },
      submittedAt:       isoDate,
      status:            { type: "string", enum: ["SUBMITTED", "GRADED", "LATE"] },
      score:             { type: "integer", minimum: 0, maximum: 100, nullable: true },
      feedback:          { type: "string", nullable: true },
      gradedBy:          { ...objectId, nullable: true },
      gradedAt:          { ...isoDate, nullable: true },
      createdAt:         isoDate,
      updatedAt:         isoDate,
    },
    required: ["_id", "assignmentId", "studentId", "courseId", "submittedAt", "status"],
  },

  SubmitAssignmentRequest: {
    type: "object",
    required: ["assignmentId"],
    properties: {
      assignmentId:      { ...objectId },
      submissionContent: { type: "string", maxLength: 50000, description: "Required when submissionType is TEXT or CODE" },
      fileUrl:           { type: "string", format: "uri",     description: "Required when submissionType is FILE or LINK" },
    },
  },

  GradeSubmissionRequest: {
    type: "object",
    required: ["score"],
    properties: {
      score:    { type: "integer", minimum: 0, maximum: 100 },
      feedback: { type: "string", maxLength: 2000 },
    },
  },

  // ── XP ───────────────────────────────────────────────────────────────────────
  XPRecord: {
    type: "object",
    properties: {
      _id:       objectId,
      studentId: objectId,
      courseId:  objectId,
      type:      { type: "string", enum: ["ATTENDANCE", "ASSIGNMENT_SUBMISSION", "MATERIAL_READ", "PARTICIPATION", "QUIZ"] },
      points:    { type: "integer" },
      earnedAt:  isoDate,
      metadata:  {
        type: "object",
        properties: {
          attendanceId: objectId,
          assignmentId: objectId,
          submissionId: objectId,
          materialId:   objectId,
          description:  { type: "string" },
        },
      },
    },
    required: ["_id", "studentId", "courseId", "type", "points", "earnedAt"],
  },

  // ── Department ────────────────────────────────────────────────────────────────
  Department: {
    type: "object",
    properties: {
      _id:         objectId,
      name:        { type: "string" },
      code:        { type: "string", example: "CS" },
      description: { type: "string" },
      head:        { ...objectId, nullable: true },
      isActive:    { type: "boolean" },
      createdAt:   isoDate,
      updatedAt:   isoDate,
    },
    required: ["_id", "name", "code"],
  },

  CreateDepartmentRequest: {
    type: "object",
    required: ["name", "code"],
    properties: {
      name:        { type: "string", maxLength: 100 },
      code:        { type: "string", maxLength: 20, example: "CS" },
      description: { type: "string", maxLength: 500 },
      head:        objectId,
    },
  },

  // ── Analytics ─────────────────────────────────────────────────────────────────
  LeaderboardEntry: {
    type: "object",
    properties: {
      rank:      { type: "integer" },
      studentId: { type: "string" },
      name:      { type: "string" },
      avatar:    { type: "string", nullable: true },
      totalXP:   { type: "integer" },
    },
    required: ["rank", "studentId", "name", "totalXP"],
  },

  CourseAnalytics: {
    type: "object",
    properties: {
      courseId:         { type: "string" },
      totalEnrollments: { type: "integer" },
      activeStudents:   { type: "integer" },
      completionRate:   { type: "number", description: "0–100" },
      averageProgress:  { type: "number" },
      averageXP:        { type: "number" },
      leaderboard:      { type: "array", items: { $ref: "#/components/schemas/LeaderboardEntry" } },
      submissionStats: {
        type: "object",
        properties: {
          total:   { type: "integer" },
          graded:  { type: "integer" },
          pending: { type: "integer" },
          late:    { type: "integer" },
        },
      },
    },
  },
};

// ─── Reusable response objects ─────────────────────────────────────────────────

const responses = {
  BadRequest: {
    description: "400 — Malformed request or invalid parameters",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
  Unauthorized: {
    description: "401 — Missing or invalid JWT",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
  Forbidden: {
    description: "403 — Insufficient role",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
  NotFound: {
    description: "404 — Resource not found",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
  Conflict: {
    description: "409 — Conflict (e.g. duplicate enrolment, email already in use)",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
  UnprocessableEntity: {
    description: "422 — Validation failed (Zod)",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
  InternalServerError: {
    description: "500 — Unexpected server error",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
  },
};

// ─── Shorthand response reference helpers ─────────────────────────────────────

const r = {
  "400": { $ref: "#/components/responses/BadRequest" },
  "401": { $ref: "#/components/responses/Unauthorized" },
  "403": { $ref: "#/components/responses/Forbidden" },
  "404": { $ref: "#/components/responses/NotFound" },
  "409": { $ref: "#/components/responses/Conflict" },
  "422": { $ref: "#/components/responses/UnprocessableEntity" },
  "500": { $ref: "#/components/responses/InternalServerError" },
};

function ok(description: string, schemaRef: string, isArray = false) {
  const schema = isArray
    ? { type: "array", items: { $ref: schemaRef } }
    : { $ref: schemaRef };
  return {
    "200": {
      description,
      content: {
        "application/json": {
          schema: {
            allOf: [{ $ref: "#/components/schemas/ApiSuccess" }, { properties: { data: schema } }],
          },
        },
      },
    },
  };
}

function created(description: string, schemaRef: string) {
  return {
    "201": {
      description,
      content: {
        "application/json": {
          schema: {
            allOf: [{ $ref: "#/components/schemas/ApiSuccess" }, { properties: { data: { $ref: schemaRef } } }],
          },
        },
      },
    },
  };
}

function json(schema: object) {
  return { "application/json": { schema } };
}

function body(schemaRef: string, required = true) {
  return { requestBody: { required, content: json({ $ref: schemaRef }) } };
}

// ─── Full OpenAPI spec ─────────────────────────────────────────────────────────

export const openApiSpec = {
  openapi: "3.0.3",

  info: {
    title:       "Questify — Gamified LMS API",
    version:     "1.0.0",
    description: [
      "REST API for **Questify**, a gamified Learning Management System built with Express, TypeScript, and MongoDB.",
      "",
      "## Authentication",
      "Most endpoints require a **Bearer JWT** in the `Authorization` header.  ",
      "Obtain tokens via `POST /api/v1/auth/login`.",
      "",
      "## Roles",
      "| Role | Description |",
      "|------|-------------|",
      "| `admin` | Full platform access |",
      "| `teacher` | Manage own courses, materials, assignments, grade submissions |",
      "| `student` | Enrol in courses, submit assignments, view own analytics |",
      "",
      "## Error format",
      "All errors follow `{ success: false, error: { code, message, statusCode, timestamp, requestId } }`.",
    ].join("\n"),
    contact: { name: "Questify Engineering", email: "api@questify.app" },
    license: { name: "MIT" },
  },

  servers: [
    { url: "http://localhost:8000", description: "Local development" },
    { url: "https://api.questify.app", description: "Production" },
  ],

  tags: [
    { name: "Auth",        description: "Authentication, session, and profile management" },
    { name: "Users",       description: "User management (self-service + admin CRUD)" },
    { name: "Courses",     description: "Course catalogue — public browse and teacher/admin management" },
    { name: "Enrollments", description: "Student self-enrolment and admin enrolment management" },
    { name: "Materials",   description: "Course learning materials" },
    { name: "Assignments", description: "Assignments and deadline management" },
    { name: "Submissions", description: "Assignment submissions and grading" },
    { name: "Analytics",   description: "Learning analytics and XP leaderboards" },
    { name: "Admin",       description: "Admin-only operations: users, courses, departments, reports, dashboard" },
    { name: "Health",      description: "Service health check" },
  ],

  components: {
    securitySchemes: {
      BearerAuth: {
        type:         "http",
        scheme:       "bearer",
        bearerFormat: "JWT",
        description:  "JWT obtained from POST /api/v1/auth/login",
      },
    },
    schemas,
    responses,
  },

  // Default security — individual endpoints override where not required
  security: [{ BearerAuth: [] }],

  paths: {

    // ── Health ─────────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Service health check",
        security: [],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success:   { type: "boolean" },
                    message:   { type: "string" },
                    env:       { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ───────────────────────────────────────────────────────────────────
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive JWT tokens",
        security: [],
        ...body("LoginRequest"),
        responses: {
          ...created("Login successful — returns access + refresh tokens", "AuthTokens"),
          ...r["400"], ...r["422"], ...r["500"],
        },
      },
    },

    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Invalidate the current session",
        responses: {
          "200": { description: "Logged out successfully" },
          ...r["401"],
        },
      },
    },

    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Return the authenticated user's profile",
        responses: {
          ...ok("Current user", "#/components/schemas/User"),
          ...r["401"],
        },
      },
    },

    "/api/v1/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change own password (requires current password)",
        ...body("ChangePasswordRequest"),
        responses: {
          "200": { description: "Password changed" },
          ...r["400"], ...r["401"], ...r["422"],
        },
      },
    },

    "/api/v1/auth/profile": {
      patch: {
        tags: ["Auth"],
        summary: "Update own display profile (name, bio, location, phone)",
        ...body("UpdateProfileRequest"),
        responses: {
          ...ok("Updated profile", "#/components/schemas/User"),
          ...r["401"], ...r["422"],
        },
      },
    },

    // ── Users ──────────────────────────────────────────────────────────────────
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List all users — Admin only",
        parameters: [
          qPage, qLimit,
          { name: "role",   in: "query", schema: { type: "string", enum: ["admin", "teacher", "student"] } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          ...ok("Paginated user list", "#/components/schemas/User", true),
          ...r["401"], ...r["403"],
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user — Admin only (returns tempPassword; no email sent)",
        ...body("CreateUserRequest"),
        responses: {
          ...created("User created with temp password", "#/components/schemas/CreateUserResponse"),
          ...r["401"], ...r["403"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/users/bulk": {
      post: {
        tags: ["Users"],
        summary: "Bulk-create users — Admin only",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["users"],
            properties: {
              users: { type: "array", items: { $ref: "#/components/schemas/CreateUserRequest" }, minItems: 1 },
            },
          }),
        },
        responses: {
          "201": { description: "Bulk create result (created count, skipped emails, errors)" },
          ...r["401"], ...r["403"], ...r["422"],
        },
      },
    },

    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get full user details — Admin only",
        parameters: [pathId],
        responses: {
          ...ok("User details", "#/components/schemas/User"),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update a user's fields — Admin only",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              firstName:  { type: "string" },
              lastName:   { type: "string" },
              role:       { type: "string", enum: ["admin", "teacher", "student"] },
              isActive:   { type: "boolean" },
              department: { type: "string" },
            },
          }),
        },
        responses: {
          ...ok("Updated user", "#/components/schemas/User"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Soft-delete (deactivate) a user — Admin only",
        parameters: [pathId],
        responses: {
          "200": { description: "User deactivated" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/users/{id}/profile": {
      get: {
        tags: ["Users"],
        summary: "Get a user's public profile",
        parameters: [pathId],
        responses: {
          ...ok("User profile", "#/components/schemas/User"),
          ...r["401"], ...r["404"],
        },
      },
    },

    "/api/v1/users/{id}/avatar": {
      patch: {
        tags: ["Users"],
        summary: "Update own avatar — self or admin",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["avatar"],
            properties: { avatar: { type: "string", format: "uri" } },
          }),
        },
        responses: {
          ...ok("Updated user", "#/components/schemas/User"),
          ...r["401"], ...r["403"], ...r["422"],
        },
      },
    },

    "/api/v1/users/{id}/change-password": {
      post: {
        tags: ["Users"],
        summary: "Change password — self or admin",
        parameters: [pathId],
        ...body("ChangePasswordRequest"),
        responses: {
          "200": { description: "Password changed" },
          ...r["401"], ...r["403"], ...r["422"],
        },
      },
    },

    "/api/v1/users/{id}/reset-password": {
      post: {
        tags: ["Users"],
        summary: "Admin reset of a user's password — returns tempPassword (no email sent)",
        parameters: [pathId],
        responses: {
          "200": {
            description: "Password reset",
            content: json({
              type: "object",
              properties: { tempPassword: { type: "string" } },
            }),
          },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    // ── Courses ────────────────────────────────────────────────────────────────
    "/api/v1/courses/search": {
      get: {
        tags: ["Courses"],
        summary: "Full-text course search — public",
        security: [],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 2 }, description: "Search term" },
          qPage, qLimit,
        ],
        responses: {
          ...ok("Matching courses", "#/components/schemas/Course", true),
          ...r["422"],
        },
      },
    },

    "/api/v1/courses": {
      get: {
        tags: ["Courses"],
        summary: "List / filter published courses — public",
        security: [],
        parameters: [
          qPage, qLimit,
          { name: "level",    in: "query", schema: { type: "string", enum: ["BACHELOR", "MASTERS"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "campus",   in: "query", schema: { type: "string" } },
        ],
        responses: {
          ...ok("Paginated course list", "#/components/schemas/Course", true),
          ...r["422"],
        },
      },
      post: {
        tags: ["Courses"],
        summary: "Create a course — Teacher or Admin",
        ...body("CreateCourseRequest"),
        responses: {
          ...created("Course created", "#/components/schemas/Course"),
          ...r["401"], ...r["403"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/courses/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Get a single course — public",
        security: [],
        parameters: [pathId],
        responses: {
          ...ok("Course details", "#/components/schemas/Course"),
          ...r["400"], ...r["404"],
        },
      },
      patch: {
        tags: ["Courses"],
        summary: "Update a course — Admin only",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({ $ref: "#/components/schemas/CreateCourseRequest" }),
        },
        responses: {
          ...ok("Updated course", "#/components/schemas/Course"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Courses"],
        summary: "Soft-delete (unpublish) a course — Admin only",
        parameters: [pathId],
        responses: {
          "200": { description: "Course unpublished" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    // ── My Enrollments (student) ───────────────────────────────────────────────
    "/api/v1/my-enrollments/enroll": {
      post: {
        tags: ["Enrollments"],
        summary: "Self-enrol in a published course — Student only",
        ...body("SelfEnrollRequest"),
        responses: {
          ...created("Enrolment created", "#/components/schemas/Enrollment"),
          ...r["401"], ...r["403"], ...r["404"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/my-enrollments": {
      get: {
        tags: ["Enrollments"],
        summary: "List own enrolments — Student only",
        parameters: [
          qPage, qLimit,
          { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "COMPLETED", "DROPPED"] } },
        ],
        responses: {
          ...ok("Student enrolment list", "#/components/schemas/Enrollment", true),
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/my-enrollments/{courseId}": {
      get: {
        tags: ["Enrollments"],
        summary: "Get own enrolment for a specific course — Student only",
        parameters: [pathCourseId],
        responses: {
          ...ok("Enrolment detail", "#/components/schemas/Enrollment"),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/my-enrollments/{enrollmentId}": {
      delete: {
        tags: ["Enrollments"],
        summary: "Self-drop a course (sets status to DROPPED) — Student only",
        parameters: [pathEnrollId],
        responses: {
          ...ok("Dropped enrolment", "#/components/schemas/Enrollment"),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    // ── Enrollments (admin) ────────────────────────────────────────────────────
    "/api/v1/enrollments": {
      get: {
        tags: ["Enrollments"],
        summary: "List all enrolments — Admin only",
        parameters: [
          qPage, qLimit,
          { name: "status",   in: "query", schema: { type: "string", enum: ["ACTIVE", "COMPLETED", "DROPPED"] } },
          { name: "courseId", in: "query", schema: objectId },
        ],
        responses: {
          ...ok("Paginated enrolment list", "#/components/schemas/Enrollment", true),
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/enrollments/course/{courseId}": {
      get: {
        tags: ["Enrollments"],
        summary: "Get all enrolments for a course — Admin only",
        parameters: [pathCourseId, qPage, qLimit],
        responses: {
          ...ok("Course enrolments", "#/components/schemas/Enrollment", true),
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/enrollments/student/{studentId}": {
      get: {
        tags: ["Enrollments"],
        summary: "Get all enrolments for a student — Admin only",
        parameters: [pathStudentId, qPage, qLimit],
        responses: {
          ...ok("Student enrolments", "#/components/schemas/Enrollment", true),
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/enrollments/{id}": {
      patch: {
        tags: ["Enrollments"],
        summary: "Update an enrolment's status or notes — Admin only",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              status: { type: "string", enum: ["ACTIVE", "COMPLETED", "DROPPED"] },
              notes:  { type: "string" },
            },
          }),
        },
        responses: {
          ...ok("Updated enrolment", "#/components/schemas/Enrollment"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Enrollments"],
        summary: "Admin hard-drop an enrolment — Admin only",
        parameters: [pathId],
        responses: {
          "200": { description: "Enrolment dropped" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    // ── Materials ──────────────────────────────────────────────────────────────
    "/api/v1/materials/course/{courseId}": {
      get: {
        tags: ["Materials"],
        summary: "List all materials for a course",
        parameters: [pathCourseId, qPage, qLimit],
        responses: {
          ...ok("Course materials", "#/components/schemas/Material", true),
          ...r["401"], ...r["404"],
        },
      },
    },

    "/api/v1/materials": {
      post: {
        tags: ["Materials"],
        summary: "Upload a material to a course — Teacher or Admin",
        ...body("CreateMaterialRequest"),
        responses: {
          ...created("Material created", "#/components/schemas/Material"),
          ...r["401"], ...r["403"], ...r["422"],
        },
      },
    },

    "/api/v1/materials/{id}/view": {
      get: {
        tags: ["Materials"],
        summary: "Record a material view (awards XP to student)",
        parameters: [pathId],
        responses: {
          ...ok("Material detail + XP awarded", "#/components/schemas/Material"),
          ...r["401"], ...r["404"],
        },
      },
    },

    "/api/v1/materials/{id}": {
      patch: {
        tags: ["Materials"],
        summary: "Update a material — Teacher or Admin",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              title:       { type: "string" },
              description: { type: "string" },
              url:         { type: "string", format: "uri" },
              order:       { type: "integer" },
              xpReward:    { type: "integer" },
              isPublished: { type: "boolean" },
            },
          }),
        },
        responses: {
          ...ok("Updated material", "#/components/schemas/Material"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Materials"],
        summary: "Delete a material — Teacher or Admin",
        parameters: [pathId],
        responses: {
          "200": { description: "Material deleted" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    // ── Assignments ────────────────────────────────────────────────────────────
    "/api/v1/assignments/course/{courseId}": {
      get: {
        tags: ["Assignments"],
        summary: "List all assignments for a course",
        parameters: [pathCourseId, qPage, qLimit],
        responses: {
          ...ok("Course assignments", "#/components/schemas/Assignment", true),
          ...r["401"], ...r["404"],
        },
      },
    },

    "/api/v1/assignments": {
      post: {
        tags: ["Assignments"],
        summary: "Create an assignment — Teacher or Admin",
        ...body("CreateAssignmentRequest"),
        responses: {
          ...created("Assignment created", "#/components/schemas/Assignment"),
          ...r["401"], ...r["403"], ...r["422"],
        },
      },
    },

    "/api/v1/assignments/{id}": {
      get: {
        tags: ["Assignments"],
        summary: "Get a single assignment",
        parameters: [pathId],
        responses: {
          ...ok("Assignment detail", "#/components/schemas/Assignment"),
          ...r["401"], ...r["404"],
        },
      },
      patch: {
        tags: ["Assignments"],
        summary: "Update an assignment — Teacher or Admin",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              title:               { type: "string" },
              description:         { type: "string" },
              instructions:        { type: "string" },
              dueDate:             { type: "string", format: "date-time" },
              totalPoints:         { type: "integer" },
              allowLateSubmission: { type: "boolean" },
              latePenalty:         { type: "integer" },
            },
          }),
        },
        responses: {
          ...ok("Updated assignment", "#/components/schemas/Assignment"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Assignments"],
        summary: "Delete an assignment — Teacher or Admin",
        parameters: [pathId],
        responses: {
          "200": { description: "Assignment deleted" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/assignments/{id}/extend-deadline": {
      post: {
        tags: ["Assignments"],
        summary: "Extend an assignment's deadline — Teacher or Admin",
        parameters: [pathId],
        ...body("ExtendDeadlineRequest"),
        responses: {
          ...ok("Assignment with updated deadline", "#/components/schemas/Assignment"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
    },

    // ── Submissions ────────────────────────────────────────────────────────────
    "/api/v1/submissions": {
      post: {
        tags: ["Submissions"],
        summary: "Submit an assignment — Student only",
        ...body("SubmitAssignmentRequest"),
        responses: {
          ...created("Submission recorded", "#/components/schemas/Submission"),
          ...r["401"], ...r["403"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/submissions/my": {
      get: {
        tags: ["Submissions"],
        summary: "List own submission history — Student only",
        parameters: [
          qPage, qLimit,
          { name: "courseId", in: "query", schema: objectId },
          { name: "status",   in: "query", schema: { type: "string", enum: ["SUBMITTED", "GRADED", "LATE"] } },
        ],
        responses: {
          ...ok("Student submissions", "#/components/schemas/Submission", true),
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/submissions/assignment/{assignmentId}": {
      get: {
        tags: ["Submissions"],
        summary: "List all submissions for an assignment — Teacher or Admin",
        parameters: [pathAssignId, qPage, qLimit],
        responses: {
          ...ok("Assignment submissions", "#/components/schemas/Submission", true),
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/submissions/{id}": {
      get: {
        tags: ["Submissions"],
        summary: "Get a single submission",
        parameters: [pathId],
        responses: {
          ...ok("Submission detail", "#/components/schemas/Submission"),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/submissions/{id}/grade": {
      patch: {
        tags: ["Submissions"],
        summary: "Grade a submission — Teacher or Admin",
        parameters: [pathId],
        ...body("GradeSubmissionRequest"),
        responses: {
          ...ok("Graded submission", "#/components/schemas/Submission"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
    },

    // ── Analytics ──────────────────────────────────────────────────────────────
    "/api/v1/analytics/course/{courseId}": {
      get: {
        tags: ["Analytics"],
        summary: "Analytics for a specific course — Teacher or Admin",
        parameters: [pathCourseId],
        responses: {
          ...ok("Course analytics", "#/components/schemas/CourseAnalytics"),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/analytics/user": {
      get: {
        tags: ["Analytics"],
        summary: "Own learning analytics — Student only",
        responses: {
          "200": { description: "Student analytics (XP, progress, streak, trends)" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/analytics/users/{userId}": {
      get: {
        tags: ["Analytics"],
        summary: "Analytics for any user — Admin only",
        parameters: [pathUserId],
        responses: {
          "200": { description: "User analytics" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/analytics/enrollments": {
      get: {
        tags: ["Analytics"],
        summary: "Platform-wide enrolment analytics — Admin only",
        responses: {
          "200": { description: "Enrolment analytics" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/analytics/xp": {
      get: {
        tags: ["Analytics"],
        summary: "XP analytics (optionally scoped to a course) — Admin only",
        parameters: [
          { name: "courseId", in: "query", schema: objectId, description: "Scope to a specific course" },
        ],
        responses: {
          "200": { description: "XP analytics with trend data" },
          ...r["401"], ...r["403"],
        },
      },
    },

    // ── Admin ──────────────────────────────────────────────────────────────────
    "/api/v1/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Public platform statistics (total users, courses, enrolments)",
        security: [],
        responses: {
          "200": { description: "Platform stats object" },
        },
      },
    },

    "/api/v1/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Admin dashboard summary — Admin only",
        responses: {
          "200": { description: "Dashboard data (recent activity, totals)" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/admin/dashboard/analytics": {
      get: {
        tags: ["Admin"],
        summary: "Detailed admin dashboard analytics — Admin only",
        responses: {
          "200": { description: "Analytics charts data" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Admin list users with advanced filters — Admin only",
        parameters: [qPage, qLimit,
          { name: "role",       in: "query", schema: { type: "string", enum: ["admin", "teacher", "student"] } },
          { name: "isActive",   in: "query", schema: { type: "boolean" } },
          { name: "department", in: "query", schema: { type: "string" } },
          { name: "search",     in: "query", schema: { type: "string" } },
        ],
        responses: {
          ...ok("Paginated admin user list", "#/components/schemas/User", true),
          ...r["401"], ...r["403"],
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Admin create user — returns tempPassword (no email sent)",
        requestBody: {
          required: true,
          content: json({ $ref: "#/components/schemas/CreateUserRequest" }),
        },
        responses: {
          ...created("User created", "#/components/schemas/CreateUserResponse"),
          ...r["401"], ...r["403"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/admin/users/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Admin update user — Admin only",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              firstName:  { type: "string" },
              lastName:   { type: "string" },
              role:       { type: "string", enum: ["admin", "teacher", "student"] },
              isActive:   { type: "boolean" },
              department: { type: "string" },
            },
          }),
        },
        responses: {
          ...ok("Updated user", "#/components/schemas/User"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Admin soft-delete user — Admin only",
        parameters: [pathId],
        responses: {
          "200": { description: "User deactivated" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/admin/users/{id}/reset-password": {
      post: {
        tags: ["Admin"],
        summary: "Admin reset user password — returns tempPassword (no email sent)",
        parameters: [pathId],
        responses: {
          "200": {
            description: "Password reset — share tempPassword manually",
            content: json({ type: "object", properties: { tempPassword: { type: "string" } } }),
          },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/admin/courses": {
      get: {
        tags: ["Admin"],
        summary: "Admin list all courses — Admin only",
        parameters: [qPage, qLimit,
          { name: "level",       in: "query", schema: { type: "string" } },
          { name: "category",    in: "query", schema: { type: "string" } },
          { name: "isPublished", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          ...ok("Admin course list", "#/components/schemas/Course", true),
          ...r["401"], ...r["403"],
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Admin create course — Admin only",
        ...body("CreateCourseRequest"),
        responses: {
          ...created("Course created", "#/components/schemas/Course"),
          ...r["401"], ...r["403"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/admin/courses/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Admin update course — Admin only",
        parameters: [pathId],
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/CreateCourseRequest" }) },
        responses: {
          ...ok("Updated course", "#/components/schemas/Course"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Admin soft-delete course — Admin only",
        parameters: [pathId],
        responses: {
          "200": { description: "Course deleted" },
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/admin/courses/{id}/assign-faculty": {
      post: {
        tags: ["Admin"],
        summary: "Assign teachers to a course — Admin only",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["teacherIds"],
            properties: { teacherIds: { type: "array", items: objectId, minItems: 1 } },
          }),
        },
        responses: {
          ...ok("Updated course", "#/components/schemas/Course"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
    },

    "/api/v1/admin/courses/{id}/unassign-faculty": {
      post: {
        tags: ["Admin"],
        summary: "Remove teachers from a course — Admin only",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["teacherIds"],
            properties: { teacherIds: { type: "array", items: objectId, minItems: 1 } },
          }),
        },
        responses: {
          ...ok("Updated course", "#/components/schemas/Course"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
    },

    "/api/v1/admin/departments": {
      get: {
        tags: ["Admin"],
        summary: "List departments — Admin only",
        parameters: [qPage, qLimit,
          { name: "isActive", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          ...ok("Department list", "#/components/schemas/Department", true),
          ...r["401"], ...r["403"],
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a department — Admin only",
        ...body("CreateDepartmentRequest"),
        responses: {
          ...created("Department created", "#/components/schemas/Department"),
          ...r["401"], ...r["403"], ...r["409"], ...r["422"],
        },
      },
    },

    "/api/v1/admin/departments/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Update a department — Admin only",
        parameters: [pathId],
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/CreateDepartmentRequest" }) },
        responses: {
          ...ok("Updated department", "#/components/schemas/Department"),
          ...r["401"], ...r["403"], ...r["404"], ...r["422"],
        },
      },
    },

    "/api/v1/admin/departments/{id}/courses": {
      get: {
        tags: ["Admin"],
        summary: "List all courses in a department — Admin only",
        parameters: [pathId],
        responses: {
          ...ok("Department courses", "#/components/schemas/Course", true),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/admin/departments/{id}/students": {
      get: {
        tags: ["Admin"],
        summary: "List students enrolled in a department's courses — Admin only",
        parameters: [pathId],
        responses: {
          ...ok("Department students", "#/components/schemas/User", true),
          ...r["401"], ...r["403"], ...r["404"],
        },
      },
    },

    "/api/v1/admin/reports/enrollment": {
      get: {
        tags: ["Admin"],
        summary: "Enrolment report — Admin only",
        parameters: [
          { name: "courseId",  in: "query", schema: objectId },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate",   in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: {
          "200": { description: "Enrolment report data" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/admin/reports/attendance": {
      get: {
        tags: ["Admin"],
        summary: "Attendance report — Admin only",
        parameters: [
          { name: "courseId",  in: "query", schema: objectId },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate",   in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: {
          "200": { description: "Attendance report data" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/admin/reports/xp": {
      get: {
        tags: ["Admin"],
        summary: "XP report — Admin only",
        parameters: [
          { name: "courseId", in: "query", schema: objectId },
          { name: "type",     in: "query", schema: { type: "string", enum: ["ATTENDANCE", "ASSIGNMENT_SUBMISSION", "MATERIAL_READ", "PARTICIPATION", "QUIZ"] } },
        ],
        responses: {
          "200": { description: "XP report data" },
          ...r["401"], ...r["403"],
        },
      },
    },

    "/api/v1/admin/reports/user-activity": {
      get: {
        tags: ["Admin"],
        summary: "User activity report — Admin only",
        responses: {
          "200": { description: "User activity data" },
          ...r["401"], ...r["403"],
        },
      },
    },
  },
} as const;
