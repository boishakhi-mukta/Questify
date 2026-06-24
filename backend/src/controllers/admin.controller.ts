import { Request, Response } from "express";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { XPModel } from "@/models/XP";
import { sendSuccess } from "@/utils/responses";

// ── GET /api/v1/admin/stats ────────────────────────────────────────────────────
export async function getStats(_req: Request, res: Response): Promise<void> {
  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    xpResult,
  ] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "teacher", isActive: true }),
    Course.countDocuments({ isPublished: true }),
    XPModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]),
  ]);

  sendSuccess(res, {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalXPDistributed: xpResult[0]?.total ?? 0,
  }, "Stats retrieved successfully");
}
