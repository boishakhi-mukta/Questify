import { Request, Response } from "express";
import { Types, type PipelineStage } from "mongoose";
import { User } from "@/models/User";
import { Enrollment } from "@/models/Enrollment";
import { Attendance } from "@/models/Attendance";
import { XPModel } from "@/models/XP";
import {
  NotFoundError,
  BadRequestError,
  AuthenticationError,
} from "@/utils/errors";
import { sendSuccess } from "@/utils/responses";
import { ERROR_CODES } from "@/config/constants";
import type { AuthenticatedRequest } from "@/types";

// ── GET /api/v1/users/:id ──────────────────────────────────────────────────────
export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  sendSuccess(res, { user });
}

// ── PATCH /api/v1/users/:id (admin only) ──────────────────────────────────────
export async function updateUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    firstName,
    lastName,
    email,
    isActive,
    profile,
  } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive?: boolean;
    profile?: {
      bio?: string;
      location?: string;
      phone?: string;
      educationLevel?: string;
      socialLinks?: string[];
    };
  };

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email.toLowerCase();
  if (isActive !== undefined) user.isActive = isActive;

  if (profile) {
    if (profile.bio !== undefined) user.profile.bio = profile.bio;
    if (profile.location !== undefined) user.profile.location = profile.location;
    if (profile.phone !== undefined) user.profile.phone = profile.phone;
    if (profile.educationLevel !== undefined)
      user.profile.educationLevel = profile.educationLevel;
    if (profile.socialLinks !== undefined)
      user.profile.socialLinks = profile.socialLinks;
  }

  await user.save({ validateModifiedOnly: true });
  sendSuccess(res, { user }, "User updated successfully");
}

// ── DELETE /api/v1/users/:id (admin only — soft delete) ───────────────────────
export async function deleteUser(
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

  sendSuccess(res, null, "User deactivated successfully");
}

// ── POST /api/v1/users/:id/change-password ────────────────────────────────────
export async function changePassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  // Explicitly select passwordHash (select: false by default)
  const user = await User.findById(req.params.id).select("+passwordHash");
  if (!user) throw new NotFoundError("User");

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new AuthenticationError(
      "Current password is incorrect.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // Assign plain text — pre-save hook detects the modification and re-hashes
  user.passwordHash = newPassword;
  await user.save({ validateModifiedOnly: true });

  sendSuccess(res, null, "Password changed successfully");
}

// ── PATCH /api/v1/users/:id/avatar ────────────────────────────────────────────
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

// ── GET /api/v1/users/:id/profile ─────────────────────────────────────────────
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.params.id;
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
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: ["$present", 1, 0] } },
      },
    },
  ];

  const [xpResult, enrolledCount, completedCount, attendanceResult] =
    await Promise.all([
      XPModel.aggregate<{ total: number }>(xpPipeline),
      Enrollment.countDocuments({ studentId: userId, status: "ACTIVE" }),
      Enrollment.countDocuments({ studentId: userId, status: "COMPLETED" }),
      Attendance.aggregate<{ total: number; present: number }>(
        attendancePipeline
      ),
    ]);

  const att = attendanceResult[0];
  const attendanceRate =
    att && att.total > 0
      ? Math.round((att.present / att.total) * 100)
      : 0;

  sendSuccess(res, {
    user,
    stats: {
      totalXP: xpResult[0]?.total ?? 0,
      coursesEnrolled: enrolledCount,
      coursesCompleted: completedCount,
      attendanceRate,
    },
  });
}
