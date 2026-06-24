import { Request, Response } from "express";
import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { Attendance } from "@/models/Attendance";
import { Submission } from "@/models/Submission";
import { XPModel } from "@/models/XP";
import { Department } from "@/models/Department";
import type { IUser } from "@/models/User";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION, ERROR_CODES } from "@/config/constants";
import { generateTempPassword } from "@/utils/password";
import {
  isClerkConfigured,
  clerkCreateUser,
  clerkUpdateUser,
  clerkDeleteUser,
  clerkFindByEmail,
} from "@/utils/clerk-admin";
import type { AuthenticatedRequest } from "@/types";

// ── Shared helpers ─────────────────────────────────────────────────────────────

function logAdmin(
  action: string,
  adminId: string,
  details: Record<string, unknown> = {}
): void {
  console.log(
    JSON.stringify({
      event: `ADMIN_${action}`,
      adminId,
      ...details,
      timestamp: new Date().toISOString(),
    })
  );
}

function parsePagination(page = "1", limit = String(PAGINATION.DEFAULT_LIMIT)) {
  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Minimal CSV serializer (no external dependency) ───────────────────────────
function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);

  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC STATS (no auth — used on marketing/landing page)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [totalStudents, totalTeachers, totalCourses, xpResult] =
    await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "teacher", isActive: true }),
      Course.countDocuments({ isPublished: true }),
      XPModel.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]),
    ]);

  sendSuccess(
    res,
    {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalXPDistributed: xpResult[0]?.total ?? 0,
    },
    "Stats retrieved successfully"
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT  — all endpoints: NO email, tempPassword returned in response
// ═══════════════════════════════════════════════════════════════════════════════

// ── POST /api/v1/admin/users ──────────────────────────────────────────────────
/**
 * Admin creates a user account.
 * A temporary password is generated and returned in the response so the
 * admin can share it with the user through any out-of-band channel.
 * No email is sent.
 */
export async function adminCreateUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email, firstName, lastName, role, department } = req.body as {
    email:       string;
    firstName:   string;
    lastName:    string;
    role:        "admin" | "teacher" | "student";
    department?: string;
  };

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    throw new ConflictError(
      `A user with email "${normalizedEmail}" already exists.`,
      ERROR_CODES.ALREADY_EXISTS
    );
  }

  const tempPassword = generateTempPassword();

  const user = await User.create({
    email:                  normalizedEmail,
    firstName:              firstName.trim(),
    lastName:               lastName.trim(),
    role,
    passwordHash:           tempPassword, // pre-save hook hashes
    isActive:               true,
    requiresPasswordChange: true,
    profile: {
      department: department?.toUpperCase().trim(),
    },
  });

  // Optional Clerk sync (non-blocking; never throws)
  let clerkSynced = false;
  if (isClerkConfigured()) {
    try {
      const clerkUser = await clerkCreateUser({
        email_address:   normalizedEmail,
        password:        tempPassword,
        first_name:      firstName.trim(),
        last_name:       lastName.trim(),
        public_metadata: { role },
      });
      user.clerkId = clerkUser.id;
      await user.save({ validateModifiedOnly: true });
      clerkSynced = true;
    } catch (err) {
      console.warn(
        JSON.stringify({ event: "CLERK_CREATE_FAILED", userId: user._id, error: String(err) })
      );
    }
  }

  logAdmin("CREATE_USER", req.user!.id, {
    targetUserId:  String(user._id),
    email:         normalizedEmail,
    role,
    department,
    clerkSynced,
  });

  sendCreated(
    res,
    {
      user,
      tempPassword,   // admin must share this out-of-band
      clerkSynced,
    },
    "User created successfully. Share the temporary password with the user directly."
  );
}

// ── GET /api/v1/admin/users ───────────────────────────────────────────────────
export async function adminListUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    page       = String(PAGINATION.DEFAULT_PAGE),
    limit      = String(PAGINATION.DEFAULT_LIMIT),
    search,
    role,
    department,
    isActive,
    sort  = "createdAt",
    order = "desc",
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter: FilterQuery<IUser> = {};

  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
  }
  if (role && ["admin", "teacher", "student"].includes(role)) {
    filter.role = role;
  }
  if (department) {
    filter["profile.department"] = department.toUpperCase();
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const allowedSort = new Set([
    "createdAt", "updatedAt", "firstName", "lastName", "email", "role", "lastLogin",
  ]);
  const sortField = allowedSort.has(sort) ? sort : "createdAt";
  const sortDir   = order === "asc" ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    users,
    buildPaginationMeta(pageNum, limitNum, total),
    "Users retrieved successfully"
  );
}

// ── PATCH /api/v1/admin/users/:id ─────────────────────────────────────────────
/**
 * Admin can update: name, role, department, status.
 * Email is immutable — delete and recreate to change it.
 */
export async function adminUpdateUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");

  const { firstName, lastName, role, isActive, department } = req.body as {
    firstName?:  string;
    lastName?:   string;
    role?:       "admin" | "teacher" | "student";
    isActive?:   boolean;
    department?: string;
  };

  const changes: Record<string, unknown> = {};

  if (firstName !== undefined) { user.firstName = firstName.trim(); changes.firstName = firstName; }
  if (lastName  !== undefined) { user.lastName  = lastName.trim();  changes.lastName  = lastName;  }
  if (role      !== undefined) { user.role      = role;             changes.role      = role;      }
  if (isActive  !== undefined) { user.isActive  = isActive;         changes.isActive  = isActive;  }
  if (department !== undefined) {
    user.profile.department = department.toUpperCase().trim();
    changes.department = user.profile.department;
  }

  await user.save({ validateModifiedOnly: true });

  // Sync name/role to Clerk if configured
  if (isClerkConfigured() && (firstName !== undefined || lastName !== undefined || role !== undefined)) {
    const clerkPayload: Record<string, unknown> = {};
    if (firstName !== undefined) clerkPayload.first_name      = firstName;
    if (lastName  !== undefined) clerkPayload.last_name       = lastName;
    if (role      !== undefined) clerkPayload.public_metadata = { role };
    try {
      let clerkId = user.clerkId;
      if (!clerkId) {
        const cu = await clerkFindByEmail(user.email);
        if (cu) clerkId = cu.id;
      }
      if (clerkId) {
        await clerkUpdateUser(clerkId, clerkPayload as Parameters<typeof clerkUpdateUser>[1]);
      }
    } catch (err) {
      console.warn(JSON.stringify({ event: "CLERK_UPDATE_FAILED", userId: user._id, error: String(err) }));
    }
  }

  logAdmin("UPDATE_USER", req.user!.id, { targetUserId: String(user._id), changes });

  sendSuccess(res, { user }, "User updated successfully");
}

// ── DELETE /api/v1/admin/users/:id ────────────────────────────────────────────
export async function adminSoftDeleteUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (req.user?.id === req.params.id) {
    throw new BadRequestError("You cannot deactivate your own account.");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");

  user.isActive = false;
  await user.save({ validateModifiedOnly: true });

  // Drop active enrollments so the seat count stays accurate
  await Enrollment.updateMany(
    { studentId: req.params.id, status: "ACTIVE" },
    { $set: { status: "DROPPED" } }
  );

  if (isClerkConfigured()) {
    try {
      let clerkId = user.clerkId;
      if (!clerkId) {
        const cu = await clerkFindByEmail(user.email);
        if (cu) clerkId = cu.id;
      }
      if (clerkId) await clerkDeleteUser(clerkId);
    } catch (err) {
      console.warn(JSON.stringify({ event: "CLERK_DELETE_FAILED", userId: user._id, error: String(err) }));
    }
  }

  logAdmin("DELETE_USER", req.user!.id, {
    targetUserId: String(user._id),
    email: user.email,
    role:  user.role,
  });

  sendSuccess(res, null, "User deactivated successfully");
}

// ── POST /api/v1/admin/users/:id/reset-password ───────────────────────────────
/**
 * Generates a new temporary password and returns it in the response.
 * No email is sent — admin must share the new password directly.
 */
export async function adminResetPassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  if (!user.isActive) {
    throw new BadRequestError("Cannot reset password for a deactivated account.");
  }

  const tempPassword = generateTempPassword();

  user.passwordHash           = tempPassword; // pre-save hook hashes
  user.requiresPasswordChange = true;
  await user.save({ validateModifiedOnly: true });

  // Clerk password update is not supported via this integration's payload type.
  // The user will need to log in with the new password through the local auth
  // flow; their Clerk session will be invalidated on next sign-in attempt.
  if (isClerkConfigured()) {
    console.warn(
      JSON.stringify({ event: "CLERK_RESET_SKIPPED", userId: String(user._id), reason: "password not in ClerkUpdatePayload" })
    );
  }

  logAdmin("RESET_PASSWORD", req.user!.id, {
    targetUserId: String(user._id),
    email: user.email,
  });

  sendSuccess(
    res,
    {
      tempPassword, // admin must share out-of-band; never log this value
      requiresPasswordChange: true,
    },
    "Password reset. Share the new temporary password with the user directly."
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE MANAGEMENT  (Admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// ── POST /api/v1/admin/courses ────────────────────────────────────────────────
export async function adminCreateCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { facultyIds, ...courseFields } = req.body as {
    facultyIds?: string[];
    [key: string]: unknown;
  };

  // Validate any specified faculty exist and are teachers
  if (facultyIds && facultyIds.length > 0) {
    const faculty = await User.find(
      { _id: { $in: facultyIds }, role: "teacher", isActive: true },
      "_id"
    ).lean();
    if (faculty.length !== facultyIds.length) {
      throw new BadRequestError(
        "One or more facultyIds do not belong to active teachers."
      );
    }
    courseFields.teachers = facultyIds.map((id) => new Types.ObjectId(id));
  }

  const course = await Course.create(courseFields);

  logAdmin("CREATE_COURSE", req.user!.id, {
    courseId:  String(course._id),
    title:     course.title,
    campus:    course.campus,
    semester:  course.semester,
    faculty:   facultyIds ?? [],
  });

  sendCreated(res, { course }, "Course created successfully");
}

// ── GET /api/v1/admin/courses ─────────────────────────────────────────────────
export async function adminListCourses(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    page        = String(PAGINATION.DEFAULT_PAGE),
    limit       = String(PAGINATION.DEFAULT_LIMIT),
    search,
    campus,
    semester,
    isPublished,
    level,
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter: Record<string, unknown> = {};

  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: re }, { description: re }];
  }
  if (campus)      filter.campus      = campus;
  if (semester)    filter.semester    = semester;
  if (level)       filter.level       = level;
  if (isPublished !== undefined) {
    filter.isPublished = isPublished === "true";
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("teachers", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Course.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    courses,
    buildPaginationMeta(pageNum, limitNum, total),
    "Courses retrieved successfully"
  );
}

// ── PATCH /api/v1/admin/courses/:id ──────────────────────────────────────────
export async function adminUpdateCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const course = await Course.findById(req.params.id);
  if (!course) throw new NotFoundError("Course");

  // Prevent changing teachers via this endpoint; use assign-faculty instead
  const { teachers: _t, ...safeFields } = req.body as Record<string, unknown>;

  const updated = await Course.findByIdAndUpdate(
    course._id,
    { $set: safeFields },
    { new: true, runValidators: true }
  );

  logAdmin("UPDATE_COURSE", req.user!.id, {
    courseId: String(course._id),
    fields:   Object.keys(safeFields),
  });

  sendSuccess(res, { course: updated }, "Course updated successfully");
}

// ── DELETE /api/v1/admin/courses/:id ─────────────────────────────────────────
/** Soft delete: unpublishes the course and keeps all data intact. */
export async function adminSoftDeleteCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const course = await Course.findById(req.params.id);
  if (!course) throw new NotFoundError("Course");

  await Course.findByIdAndUpdate(course._id, { $set: { isPublished: false } });

  logAdmin("DELETE_COURSE", req.user!.id, {
    courseId: String(course._id),
    title:    course.title,
  });

  sendSuccess(res, null, "Course unpublished. All enrollment data has been preserved.");
}

// ── POST /api/v1/admin/courses/:id/assign-faculty ────────────────────────────
export async function assignFaculty(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const course = await Course.findById(req.params.id);
  if (!course) throw new NotFoundError("Course");

  const { facultyIds } = req.body as { facultyIds: string[] };

  // Validate each ID is an active teacher
  const faculty = await User.find(
    { _id: { $in: facultyIds }, role: "teacher", isActive: true },
    "_id"
  ).lean();
  if (faculty.length !== facultyIds.length) {
    throw new BadRequestError(
      "One or more facultyIds do not belong to active teachers."
    );
  }

  const objectIds = facultyIds.map((id) => new Types.ObjectId(id));

  const updated = await Course.findByIdAndUpdate(
    course._id,
    { $addToSet: { teachers: { $each: objectIds } } },
    { new: true }
  ).populate("teachers", "firstName lastName email");

  logAdmin("ASSIGN_FACULTY", req.user!.id, {
    courseId:   String(course._id),
    courseTitle: course.title,
    addedIds:   facultyIds,
  });

  sendSuccess(res, { course: updated }, "Faculty assigned to course successfully");
}

// ── POST /api/v1/admin/courses/:id/unassign-faculty ──────────────────────────
export async function unassignFaculty(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const course = await Course.findById(req.params.id);
  if (!course) throw new NotFoundError("Course");

  const { facultyId } = req.body as { facultyId: string };

  const isAssigned = course.teachers.some((t) => t.toString() === facultyId);
  if (!isAssigned) {
    throw new BadRequestError("This faculty member is not assigned to the course.");
  }

  const updated = await Course.findByIdAndUpdate(
    course._id,
    { $pull: { teachers: new Types.ObjectId(facultyId) } },
    { new: true }
  ).populate("teachers", "firstName lastName email");

  logAdmin("UNASSIGN_FACULTY", req.user!.id, {
    courseId:   String(course._id),
    courseTitle: course.title,
    removedId:  facultyId,
  });

  sendSuccess(res, { course: updated }, "Faculty removed from course successfully");
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT MANAGEMENT  (Admin only)
// Department.code maps to Course.campus for course membership queries.
// ═══════════════════════════════════════════════════════════════════════════════

// ── POST /api/v1/admin/departments ───────────────────────────────────────────
export async function createDepartment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { name, code, description, head } = req.body as {
    name:         string;
    code:         string;
    description?: string;
    head?:        string;
  };

  if (head) {
    const headUser = await User.findById(head).lean();
    if (!headUser || !["teacher", "admin"].includes(headUser.role)) {
      throw new BadRequestError("Department head must be an active teacher or admin.");
    }
  }

  const dept = await Department.create({
    name:        name.trim(),
    code:        code.toUpperCase().trim(),
    description: description?.trim(),
    head:        head ? new Types.ObjectId(head) : undefined,
  });

  logAdmin("CREATE_DEPARTMENT", req.user!.id, { deptId: String(dept._id), code: dept.code });

  sendCreated(res, { department: dept }, "Department created successfully");
}

// ── GET /api/v1/admin/departments ────────────────────────────────────────────
/** Returns departments enriched with live course and student counts. */
export async function listDepartments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { isActive } = req.query as { isActive?: string };

  const filter: Record<string, unknown> = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const departments = await Department.find(filter)
    .populate("head", "firstName lastName email")
    .sort({ name: 1 })
    .lean();

  // Attach course and active-student counts per department
  const enriched = await Promise.all(
    departments.map(async (dept) => {
      const [courseCount, studentCount] = await Promise.all([
        Course.countDocuments({ campus: dept.code }),
        Enrollment.distinct("studentId", {
          status: "ACTIVE",
          courseId: {
            $in: await Course.distinct("_id", { campus: dept.code }),
          },
        }).then((ids) => ids.length),
      ]);
      return { ...dept, courseCount, studentCount };
    })
  );

  sendSuccess(res, { departments: enriched }, "Departments retrieved successfully");
}

// ── PATCH /api/v1/admin/departments/:id ──────────────────────────────────────
export async function updateDepartment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dept = await Department.findById(req.params.id);
  if (!dept) throw new NotFoundError("Department");

  const { name, description, head, isActive } = req.body as {
    name?:        string;
    description?: string;
    head?:        string;
    isActive?:    boolean;
  };

  if (name        !== undefined) dept.name        = name.trim();
  if (description !== undefined) dept.description = description.trim();
  if (isActive    !== undefined) dept.isActive    = isActive;
  if (head !== undefined) {
    const headUser = await User.findById(head).lean();
    if (!headUser || !["teacher", "admin"].includes(headUser.role)) {
      throw new BadRequestError("Department head must be an active teacher or admin.");
    }
    dept.head = new Types.ObjectId(head);
  }

  await dept.save({ validateModifiedOnly: true });

  logAdmin("UPDATE_DEPARTMENT", req.user!.id, { deptId: String(dept._id) });

  sendSuccess(res, { department: dept }, "Department updated successfully");
}

// ── GET /api/v1/admin/departments/:id/courses ────────────────────────────────
export async function getDepartmentCourses(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dept = await Department.findById(req.params.id).lean();
  if (!dept) throw new NotFoundError("Department");

  const {
    page  = String(PAGINATION.DEFAULT_PAGE),
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter = { campus: dept.code };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("teachers", "firstName lastName email")
      .sort({ title: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Course.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    courses,
    buildPaginationMeta(pageNum, limitNum, total),
    `Courses in ${dept.name} retrieved successfully`
  );
}

// ── GET /api/v1/admin/departments/:id/students ───────────────────────────────
/** Returns distinct active students enrolled in any course within the department. */
export async function getDepartmentStudents(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const dept = await Department.findById(req.params.id).lean();
  if (!dept) throw new NotFoundError("Department");

  const {
    page  = String(PAGINATION.DEFAULT_PAGE),
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);

  // Find distinct students enrolled in courses belonging to this department
  const pipeline: PipelineStage[] = [
    { $match: { status: "ACTIVE" } },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $match: { "course.campus": dept.code } },
    { $group: { _id: "$studentId" } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $project: {
        _id:               "$student._id",
        firstName:         "$student.firstName",
        lastName:          "$student.lastName",
        email:             "$student.email",
        avatar:            "$student.avatar",
        "profile.department": "$student.profile.department",
      },
    },
    { $sort: { lastName: 1, firstName: 1 } },
    {
      $facet: {
        data:  [{ $skip: skip }, { $limit: limitNum }],
        count: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await Enrollment.aggregate(pipeline);
  const total: number = (result.count as { total: number }[])[0]?.total ?? 0;

  sendPaginated(
    res,
    result.data as unknown[],
    buildPaginationMeta(pageNum, limitNum, total),
    `Students in ${dept.name} retrieved successfully`
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD  (Admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /api/v1/admin/dashboard ───────────────────────────────────────────────
export async function getDashboard(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalStudents,
    totalFaculty,
    totalCourses,
    totalEnrollments,
    activeEnrollments,
    newEnrollmentsThisMonth,
    activeCourses,
    upcomingDeadlines,
    xpResult,
  ] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "teacher", isActive: true }),
    Course.countDocuments({}),
    Enrollment.countDocuments({}),
    Enrollment.countDocuments({ status: "ACTIVE" }),
    Enrollment.countDocuments({ enrolledAt: { $gte: monthStart } }),
    Course.countDocuments({ isPublished: true }),
    Submission.countDocuments({
      submittedAt: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    XPModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]),
  ]);

  sendSuccess(
    res,
    {
      users: { totalStudents, totalFaculty },
      courses: { totalCourses, activeCourses },
      enrollments: { totalEnrollments, activeEnrollments, newEnrollmentsThisMonth },
      xp: { totalDistributed: xpResult[0]?.total ?? 0 },
      upcomingAssignmentsThisWeek: upcomingDeadlines,
    },
    "Dashboard stats retrieved successfully"
  );
}

// ── GET /api/v1/admin/dashboard/analytics ─────────────────────────────────────
export async function getDashboardAnalytics(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const [
    enrollmentTrend,
    coursePopularity,
    xpByType,
    campusBreakdown,
    submissionTrend,
  ] = await Promise.all([
    // Student enrollment trend — grouped by year-month for last 12 months
    Enrollment.aggregate<{ year: number; month: number; count: number }>([
      { $match: { enrolledAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id:   { year: { $year: "$enrolledAt" }, month: { $month: "$enrolledAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1 } },
    ]),

    // Top 10 most enrolled courses
    Course.aggregate<{ courseId: string; title: string; enrollmentCount: number }>([
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, courseId: { $toString: "$_id" }, title: 1, enrollmentCount: 1 } },
    ]),

    // XP distribution by activity type
    XPModel.aggregate<{ type: string; totalPoints: number; count: number }>([
      {
        $group: {
          _id:         "$type",
          totalPoints: { $sum: "$points" },
          count:       { $sum: 1 },
        },
      },
      { $project: { _id: 0, type: "$_id", totalPoints: 1, count: 1 } },
      { $sort: { totalPoints: -1 } },
    ]),

    // Enrollment and course count by campus (department proxy)
    Course.aggregate<{ campus: string; courseCount: number }>([
      { $group: { _id: "$campus", courseCount: { $sum: 1 } } },
      { $project: { _id: 0, campus: "$_id", courseCount: 1 } },
      { $sort: { courseCount: -1 } },
    ]),

    // Submission trend (graded vs ungraded) over last 12 months
    Submission.aggregate<{ year: number; month: number; status: string; count: number }>([
      { $match: { submittedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id:   { year: { $year: "$submittedAt" }, month: { $month: "$submittedAt" }, status: "$status" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year", month: "$_id.month", status: "$_id.status", count: 1,
        },
      },
    ]),
  ]);

  sendSuccess(
    res,
    {
      enrollmentTrend,
      coursePopularity,
      xpDistribution: xpByType,
      campusBreakdown,
      submissionTrend,
    },
    "Analytics retrieved successfully"
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS  (Admin only)
// All reports accept ?format=csv to return text/csv instead of JSON
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /api/v1/admin/reports/enrollment ──────────────────────────────────────
export async function enrollmentReport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId, semester, status, format } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (courseId) filter.courseId = new Types.ObjectId(courseId);
  if (semester) filter.semester = semester;
  if (status)   filter.status   = status;

  const enrollments = await Enrollment.find(filter)
    .populate<{ student?: { firstName: string; lastName: string; email: string } }>(
      "student", "firstName lastName email"
    )
    .populate<{ course?: { title: string; campus: string; semester?: string } }>(
      "course", "title campus semester"
    )
    .sort({ enrolledAt: -1 })
    .lean();

  const byStatus = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  if (format === "csv") {
    const rows = enrollments.map((e) => ({
      enrollmentId:   String(e._id),
      student:        `${(e as { student?: { firstName: string; lastName: string } }).student?.firstName ?? ""} ${(e as { student?: { firstName: string; lastName: string } }).student?.lastName ?? ""}`.trim(),
      email:          (e as { student?: { email: string } }).student?.email ?? "",
      course:         (e as { course?: { title: string } }).course?.title ?? "",
      campus:         (e as { course?: { campus: string } }).course?.campus ?? "",
      semester:       e.semester ?? "",
      status:         e.status,
      enrolledAt:     e.enrolledAt.toISOString(),
      progressPct:    e.progressPercentage,
      totalXP:        e.totalXpEarned,
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="enrollment-report-${Date.now()}.csv"`);
    res.status(200).send(toCsv(rows));
    return;
  }

  sendSuccess(
    res,
    { total: enrollments.length, byStatus, enrollments },
    "Enrollment report generated successfully"
  );
}

// ── GET /api/v1/admin/reports/attendance ──────────────────────────────────────
/**
 * Returns per-course attendance rates and flags at-risk students (< 75%).
 */
export async function attendanceReport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId, atRiskThreshold = "75" } = req.query as Record<string, string>;
  const threshold = parseFloat(atRiskThreshold);

  const matchStage: PipelineStage.Match = courseId
    ? { $match: { courseId: new Types.ObjectId(courseId) } }
    : { $match: {} };

  const pipeline: PipelineStage[] = [
    matchStage,
    {
      $group: {
        _id:     { studentId: "$studentId", courseId: "$courseId" },
        total:   { $sum: 1 },
        present: { $sum: { $cond: ["$present", 1, 0] } },
      },
    },
    {
      $addFields: {
        attendanceRate: {
          $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1],
        },
      },
    },
    {
      $lookup: {
        from: "users", localField: "_id.studentId", foreignField: "_id", as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $lookup: {
        from: "courses", localField: "_id.courseId", foreignField: "_id", as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id:            0,
        studentId:      "$_id.studentId",
        courseId:       "$_id.courseId",
        studentName:    { $concat: ["$student.firstName", " ", "$student.lastName"] },
        studentEmail:   "$student.email",
        courseTitle:    "$course.title",
        campus:         "$course.campus",
        total:          1,
        present:        1,
        attendanceRate: 1,
        isAtRisk:       { $lt: ["$attendanceRate", threshold] },
      },
    },
    { $sort: { attendanceRate: 1 } },
  ];

  const records = await Attendance.aggregate(pipeline);
  const atRisk  = records.filter((r) => r.isAtRisk);

  sendSuccess(
    res,
    {
      totalRecords: records.length,
      atRiskCount:  atRisk.length,
      threshold,
      atRiskStudents: atRisk,
      allRecords:     records,
    },
    "Attendance report generated successfully"
  );
}

// ── GET /api/v1/admin/reports/xp ─────────────────────────────────────────────
export async function xpReport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.query as Record<string, string>;

  const matchStage = courseId
    ? { $match: { courseId: new Types.ObjectId(courseId) } }
    : { $match: {} };

  const [byType, topEarners, byCourse] = await Promise.all([
    XPModel.aggregate([
      matchStage,
      { $group: { _id: "$type", totalPoints: { $sum: "$points" }, events: { $sum: 1 } } },
      { $project: { _id: 0, type: "$_id", totalPoints: 1, events: 1 } },
      { $sort: { totalPoints: -1 } },
    ]),

    XPModel.aggregate([
      matchStage,
      { $group: { _id: "$studentId", totalXP: { $sum: "$points" } } },
      { $sort: { totalXP: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users", localField: "_id", foreignField: "_id", as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          studentId: { $toString: "$_id" },
          name: { $concat: ["$student.firstName", " ", "$student.lastName"] },
          email: "$student.email",
          totalXP: 1,
        },
      },
    ]),

    courseId
      ? []
      : XPModel.aggregate([
          { $group: { _id: "$courseId", totalPoints: { $sum: "$points" } } },
          { $sort: { totalPoints: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "courses", localField: "_id", foreignField: "_id", as: "course",
            },
          },
          { $unwind: "$course" },
          {
            $project: {
              _id: 0,
              courseId: { $toString: "$_id" },
              courseTitle: "$course.title",
              totalPoints: 1,
            },
          },
        ]),
  ]);

  sendSuccess(
    res,
    { byType, topEarners, byCourse },
    "XP report generated successfully"
  );
}

// ── GET /api/v1/admin/reports/user-activity ───────────────────────────────────
/**
 * User activity summary based on lastLogin timestamps and account metadata.
 * Audit events are written to structured stdout logs (not a DB collection)
 * so this report returns login-derived activity metrics instead.
 */
export async function userActivityReport(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const now          = new Date();
  const last7Days    = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const last30Days   = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    activeLastWeek,
    activeLastMonth,
    newUsersLastMonth,
    neverLoggedIn,
    byRole,
    recentLogins,
  ] = await Promise.all([
    User.countDocuments({ lastLogin: { $gte: last7Days },  isActive: true }),
    User.countDocuments({ lastLogin: { $gte: last30Days }, isActive: true }),
    User.countDocuments({ createdAt: { $gte: last30Days } }),
    User.countDocuments({ lastLogin: { $exists: false }, isActive: true }),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $project: { _id: 0, role: "$_id", count: 1 } },
    ]),
    User.find({ lastLogin: { $exists: true }, isActive: true })
      .sort({ lastLogin: -1 })
      .limit(50)
      .select("firstName lastName email role lastLogin")
      .lean(),
  ]);

  sendSuccess(
    res,
    {
      loginActivity: {
        activeLastWeek,
        activeLastMonth,
        neverLoggedIn,
      },
      newUsersLastMonth,
      usersByRole:   byRole,
      recentLogins,
    },
    "User activity report generated successfully"
  );
}
