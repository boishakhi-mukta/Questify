/**
 * ============================================================================
 * QUESTIFY CONTROLLER: User Controller
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Updates avatar graphics, bios, and gets profile information.
 * 
 * WHY IT EXISTS:
 * Allows users to fetch and update details.
 * 
 * HOW IT WORKS (Technical Overview):
 * Directly manages user collection details.
 * ============================================================================
 */

import { Response } from "express";
import { Types, type PipelineStage, type FilterQuery } from "mongoose";
import { User } from "@/models/User";
import { Enrollment } from "@/models/Enrollment";
import { Attendance } from "@/models/Attendance";
import { XPModel } from "@/models/XP";
import { Course } from "@/models/Course";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  AuthenticationError,
} from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION, ERROR_CODES } from "@/config/constants";
import { generateTempPassword } from "@/utils/password";
import { sendCredentialEmail, sendPasswordResetEmail } from "@/utils/email";
import {
  isClerkConfigured,
  clerkCreateUser,
  clerkUpdateUser,
  clerkDeleteUser,
  clerkFindByEmail,
} from "@/utils/clerk-admin";
import { env } from "@/config/environment";
import { logAction, logger } from "@/utils/logger";
import type { AuthenticatedRequest } from "@/types";
import type { IUser } from "@/models/User";

// ── Audit log helper ───────────────────────────────────────────────────────────
// Records "which admin did what to which user" in the logs, for accountability.
function logAdminEvent(
  action: string,
  adminId: string,
  targetUserId: string,
  extra: Record<string, unknown> = {}
): void {
  logAction(`ADMIN_${action}`, { adminId, targetUserId, ...extra });
}

// ── POST /api/v1/users (admin) ─────────────────────────────────────────────────
// Admin creates a new student or teacher account with a random temporary
// password. If Clerk (the external login provider) is configured, a matching
// account is created there too, and the credentials are emailed to the new user.
export async function createUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email, firstName, lastName, role } = req.body as {
    email:     string;
    firstName: string;
    lastName:  string;
    role:      "student" | "teacher";
  };

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ConflictError(
      `A user with email "${email}" already exists.`,
      ERROR_CODES.ALREADY_EXISTS
    );
  }

  const tempPassword = generateTempPassword();

  const user = await User.create({
    email:      email.toLowerCase(),
    firstName:  firstName.trim(),
    lastName:   lastName.trim(),
    role,
    passwordHash:           tempPassword,  // pre-save hook hashes this
    isActive:               true,
    requiresPasswordChange: true,
  });

  // ── Optional Clerk sync ────────────────────────────────────────────────────
  let clerkWarning: string | undefined;
  if (isClerkConfigured()) {
    try {
      const clerkUser = await clerkCreateUser({
        email_address:   email.toLowerCase(),
        password:        tempPassword,
        first_name:      firstName.trim(),
        last_name:       lastName.trim(),
        public_metadata: { role },
      });
      user.clerkId = clerkUser.id;
      await user.save({ validateModifiedOnly: true });
    } catch (err) {
      clerkWarning = err instanceof Error ? err.message : "Clerk sync failed";
      logger.warn("CLERK_CREATE_FAILED", { userId: user._id, error: clerkWarning });
    }
  }

  // ── Email credentials ──────────────────────────────────────────────────────
  const emailResult = await sendCredentialEmail({
    to:           email.toLowerCase(),
    name:         `${firstName} ${lastName}`,
    tempPassword,
    loginUrl:     `${env.APP_URL}/auth/login`,
    role,
  });

  logAdminEvent("CREATE_USER", req.user!.id, String(user._id), {
    email: email.toLowerCase(),
    role,
    emailSent: emailResult.sent,
    clerkSynced: !clerkWarning,
  });

  sendCreated(res, {
    user,
    emailSent:   emailResult.sent,
    emailNote:   emailResult.sent ? undefined : emailResult.error,
    clerkSynced: !clerkWarning,
    clerkNote:   clerkWarning,
  }, "User created successfully");
}

// ── GET /api/v1/users (admin) ──────────────────────────────────────────────────
// Powers the admin's user directory: searches by name/email, filters by role
// or active status, and returns results sorted and paginated.
export async function listUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    page     = String(PAGINATION.DEFAULT_PAGE),
    limit    = String(PAGINATION.DEFAULT_LIMIT),
    search,
    role,
    isActive,
    sort     = "createdAt",
    order    = "desc",
  } = req.query as {
    page?:     string;
    limit?:    string;
    search?:   string;
    role?:     string;
    isActive?: string;
    sort?:     string;
    order?:    string;
  };

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );

  const filter: FilterQuery<IUser> = {};

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { firstName: regex },
      { lastName:  regex },
      { email:     regex },
    ];
  }

  if (role && ["admin", "teacher", "student"].includes(role)) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const allowedSortFields = new Set(["createdAt", "updatedAt", "firstName", "lastName", "email", "role", "lastLogin"]);
  const sortField = allowedSortFields.has(sort) ? sort : "createdAt";
  const sortDir   = order === "asc" ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((pageNum - 1) * limitNum)
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

// ── GET /api/v1/users/:id (admin — full detail) ───────────────────────────────
// Builds the full admin-facing profile page for one user: their basic info
// plus a snapshot of their activity — XP earned, courses enrolled/completed
// (if a student), courses taught (if a teacher), and attendance rate.
export async function getUserDetails(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User");

  const studentId = new Types.ObjectId(id);

  const [enrollments, teaching, xpResult, attendanceResult] = await Promise.all([
    Enrollment.find({ studentId: id })
      .populate("courseId", "title code category")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),

    Course.find({ teachers: id })
      .select("title code category isPublished")
      .lean(),

    XPModel.aggregate<{ total: number }>([
      { $match: { studentId } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]),

    Attendance.aggregate<{ total: number; present: number }>([
      { $match: { studentId } },
      {
        $group: {
          _id:     null,
          total:   { $sum: 1 },
          present: { $sum: { $cond: ["$present", 1, 0] } },
        },
      },
    ]),
  ]);

  const att = attendanceResult[0];
  const attendanceRate = att && att.total > 0
    ? Math.round((att.present / att.total) * 100)
    : 0;

  sendSuccess(res, {
    user,
    stats: {
      totalXP:          xpResult[0]?.total ?? 0,
      coursesEnrolled:  enrollments.filter((e) => e.status === "ACTIVE").length,
      coursesCompleted: enrollments.filter((e) => e.status === "COMPLETED").length,
      attendanceRate,
    },
    enrollments,
    teaching,
  });
}

// ── Simple GET /api/v1/users/:id (public — basic info) ────────────────────────
// A lightweight lookup that returns just a user's basic profile info, without
// the extra activity stats that getUserDetails computes.
export async function getUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  sendSuccess(res, { user });
}

// ── PATCH /api/v1/users/:id (admin only) ──────────────────────────────────────
// Lets an admin edit another user's profile, role, or active status. If the
// person's name or role changed and they're synced with Clerk, that update
// is mirrored over there too (a failure there is only logged, not fatal).
export async function updateUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    firstName,
    lastName,
    role,
    isActive,
    avatar,
    profile,
  } = req.body as {
    firstName?: string;
    lastName?:  string;
    role?:      "admin" | "teacher" | "student";
    isActive?:  boolean;
    avatar?:    string;
    profile?: {
      bio?:            string;
      location?:       string;
      phone?:          string;
      educationLevel?: string;
      socialLinks?:    string[];
    };
  };

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");

  const changes: Record<string, unknown> = {};

  if (firstName !== undefined) { user.firstName = firstName; changes.firstName = firstName; }
  if (lastName  !== undefined) { user.lastName  = lastName;  changes.lastName  = lastName;  }
  if (role      !== undefined) { user.role      = role;      changes.role      = role;      }
  if (isActive  !== undefined) { user.isActive  = isActive;  changes.isActive  = isActive;  }
  if (avatar    !== undefined) { user.avatar    = avatar;    changes.avatar    = avatar;    }

  if (profile) {
    if (profile.bio            !== undefined) user.profile.bio            = profile.bio;
    if (profile.location       !== undefined) user.profile.location       = profile.location;
    if (profile.phone          !== undefined) user.profile.phone          = profile.phone;
    if (profile.educationLevel !== undefined) user.profile.educationLevel = profile.educationLevel;
    if (profile.socialLinks    !== undefined) user.profile.socialLinks    = profile.socialLinks;
  }

  await user.save({ validateModifiedOnly: true });

  // ── Optional Clerk sync ────────────────────────────────────────────────────
  if (isClerkConfigured() && (firstName !== undefined || lastName !== undefined || role !== undefined)) {
    const clerkPayload: Record<string, unknown> = {};
    if (firstName !== undefined) clerkPayload.first_name = firstName;
    if (lastName  !== undefined) clerkPayload.last_name  = lastName;
    if (role      !== undefined) clerkPayload.public_metadata = { role };

    try {
      let clerkId = user.clerkId;
      if (!clerkId) {
        const clerkUser = await clerkFindByEmail(user.email);
        if (clerkUser) clerkId = clerkUser.id;
      }
      if (clerkId) {
        await clerkUpdateUser(clerkId, clerkPayload as Parameters<typeof clerkUpdateUser>[1]);
      }
    } catch (err) {
      logger.warn("CLERK_UPDATE_FAILED", { userId: user._id, error: String(err) });
    }
  }

  logAdminEvent("UPDATE_USER", req.user!.id, String(user._id), { changes });

  sendSuccess(res, { user }, "User updated successfully");
}

// ── DELETE /api/v1/users/:id (admin — soft delete + cascade) ──────────────────
// Deactivates a user account rather than erasing it — an admin can't
// deactivate themselves. Any courses the person was actively enrolled in are
// marked dropped, and their external Clerk account (if any) is removed too.
export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (req.user?.id === req.params.id) {
    throw new BadRequestError("You cannot deactivate your own account.");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");

  // ── Soft delete ────────────────────────────────────────────────────────────
  user.isActive = false;
  await user.save({ validateModifiedOnly: true });

  // ── Drop all active enrollments ────────────────────────────────────────────
  await Enrollment.updateMany(
    { studentId: req.params.id, status: "ACTIVE" },
    { $set: { status: "DROPPED" } }
  );

  // ── Optional Clerk delete ──────────────────────────────────────────────────
  if (isClerkConfigured()) {
    try {
      let clerkId = user.clerkId;
      if (!clerkId) {
        const clerkUser = await clerkFindByEmail(user.email);
        if (clerkUser) clerkId = clerkUser.id;
      }
      if (clerkId) await clerkDeleteUser(clerkId);
    } catch (err) {
      logger.warn("CLERK_DELETE_FAILED", { userId: user._id, error: String(err) });
    }
  }

  logAdminEvent("DELETE_USER", req.user!.id, String(user._id), {
    email: user.email,
    role:  user.role,
  });

  sendSuccess(res, null, "User deactivated successfully");
}

// ── POST /api/v1/users/:id/reset-password (admin) ─────────────────────────────
// Lets an admin force-reset someone's password to a new random temporary one
// (e.g. because the user forgot theirs) and emails it to them.
export async function resetPassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  if (!user.isActive) throw new BadRequestError("Cannot reset password for a deactivated account.");

  const tempPassword = generateTempPassword();

  user.passwordHash           = tempPassword;  // pre-save hook hashes
  user.requiresPasswordChange = true;
  await user.save({ validateModifiedOnly: true });

  // ── Optional Clerk password update ────────────────────────────────────────
  if (isClerkConfigured()) {
    try {
      let clerkId = user.clerkId;
      if (!clerkId) {
        const clerkUser = await clerkFindByEmail(user.email);
        if (clerkUser) clerkId = clerkUser.id;
      }
      if (clerkId) {
        await clerkUpdateUser(clerkId, { first_name: user.firstName });
      }
    } catch (err) {
      logger.warn("CLERK_RESET_FAILED", { userId: user._id, error: String(err) });
    }
  }

  const emailResult = await sendPasswordResetEmail(
    user.email,
    user.fullName,
    tempPassword,
    `${env.APP_URL}/auth/login`
  );

  logAdminEvent("RESET_PASSWORD", req.user!.id, String(user._id), {
    email:     user.email,
    emailSent: emailResult.sent,
  });

  sendSuccess(res, {
    emailSent: emailResult.sent,
    emailNote: emailResult.sent ? undefined : emailResult.error,
  }, "Password reset successfully");
}

// ── POST /api/v1/users/bulk (admin) ───────────────────────────────────────────
// Creates many user accounts at once (e.g. importing a whole class list).
// Each one is processed independently, so if one entry fails (like a
// duplicate email), the rest still get created — the response lists which
// ones succeeded and which failed, and why.
export async function bulkCreateUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { users: entries } = req.body as {
    users: Array<{ email: string; firstName: string; lastName: string; role: "student" | "teacher" }>;
  };

  const results: Array<{ email: string; status: "created" | "failed"; error?: string }> = [];
  let created = 0;

  for (const entry of entries) {
    try {
      const email = entry.email.toLowerCase();

      const exists = await User.findOne({ email });
      if (exists) {
        results.push({ email, status: "failed", error: "Email already exists" });
        continue;
      }

      const tempPassword = generateTempPassword();

      const user = await User.create({
        email,
        firstName:    entry.firstName.trim(),
        lastName:     entry.lastName.trim(),
        role:         entry.role,
        passwordHash: tempPassword,
        isActive:     true,
      });

      // Clerk sync (non-blocking)
      if (isClerkConfigured()) {
        try {
          const clerkUser = await clerkCreateUser({
            email_address:   email,
            password:        tempPassword,
            first_name:      entry.firstName.trim(),
            last_name:       entry.lastName.trim(),
            public_metadata: { role: entry.role },
          });
          user.clerkId = clerkUser.id;
          await user.save({ validateModifiedOnly: true });
        } catch (err) {
          logger.warn("CLERK_BULK_CREATE_FAILED", { email, error: String(err) });
        }
      }

      // Email (non-blocking)
      await sendCredentialEmail({
        to:           email,
        name:         `${entry.firstName} ${entry.lastName}`,
        tempPassword,
        loginUrl:     `${env.APP_URL}/auth/login`,
        role:         entry.role,
      });

      results.push({ email, status: "created" });
      created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ email: entry.email, status: "failed", error: msg });
    }
  }

  logAdminEvent("BULK_CREATE_USERS", req.user!.id, "batch", {
    requested: entries.length,
    created,
    failed:    entries.length - created,
  });

  sendCreated(res, {
    summary: { requested: entries.length, created, failed: entries.length - created },
    results,
  }, `Bulk creation complete: ${created}/${entries.length} users created`);
}

// ── POST /api/v1/users/:id/change-password (self or admin) ────────────────────
// Changes a user's password after confirming the current one is correct first.
export async function changePassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword:     string;
  };

  const user = await User.findById(req.params.id).select("+passwordHash");
  if (!user) throw new NotFoundError("User");

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new AuthenticationError(
      "Current password is incorrect.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  user.passwordHash = newPassword;  // pre-save hook hashes
  await user.save({ validateModifiedOnly: true });

  sendSuccess(res, null, "Password changed successfully");
}

// ── PATCH /api/v1/users/:id/avatar (self or admin) ────────────────────────────
// Updates a user's profile picture URL.
export async function updateAvatar(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { avatar } = req.body as { avatar: string };

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");

  user.avatar = avatar;
  await user.save({ validateModifiedOnly: true });

  sendSuccess(res, { user }, "Avatar updated successfully");
}

// ── GET /api/v1/users/:id/profile (authenticated) ─────────────────────────────
// Returns a user's profile along with their learning stats — total XP,
// how many courses they're enrolled in vs. completed, and attendance rate.
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId   = req.params.id;
  const studentId = new Types.ObjectId(userId);

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");

  const xpPipeline: PipelineStage[] = [
    { $match: { studentId } },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ];

  const attendancePipeline: PipelineStage[] = [
    { $match: { studentId } },
    {
      $group: {
        _id:     null,
        total:   { $sum: 1 },
        present: { $sum: { $cond: ["$present", 1, 0] } },
      },
    },
  ];

  const [xpResult, enrolledCount, completedCount, attendanceResult] = await Promise.all([
    XPModel.aggregate<{ total: number }>(xpPipeline),
    Enrollment.countDocuments({ studentId: userId, status: "ACTIVE" }),
    Enrollment.countDocuments({ studentId: userId, status: "COMPLETED" }),
    Attendance.aggregate<{ total: number; present: number }>(attendancePipeline),
  ]);

  const att = attendanceResult[0];
  const attendanceRate = att && att.total > 0
    ? Math.round((att.present / att.total) * 100)
    : 0;

  sendSuccess(res, {
    user,
    stats: {
      totalXP:          xpResult[0]?.total ?? 0,
      coursesEnrolled:  enrolledCount,
      coursesCompleted: completedCount,
      attendanceRate,
    },
  });
}
