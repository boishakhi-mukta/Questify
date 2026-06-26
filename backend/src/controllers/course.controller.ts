import { Request, Response } from "express";
import { Types } from "mongoose";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { Material } from "@/models/Material";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { Attendance } from "@/models/Attendance";
import { XPModel } from "@/models/XP";
import { NotFoundError, BadRequestError } from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION } from "@/config/constants";
import type { AuthenticatedRequest } from "@/types";

// ── POST /api/v1/courses ───────────────────────────────────────────────────────
export async function createCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const course = await Course.create(req.body);
  sendCreated(res, { course }, "Course created successfully");
}

// ── GET /api/v1/courses ────────────────────────────────────────────────────────
export async function getCourses(req: Request, res: Response): Promise<void> {
  const {
    category,
    level,
    campus,
    search,
    isFeatured,
    sort = "createdAt",
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { isPublished: true };

  if (category) filter.category = { $regex: category, $options: "i" };
  if (level) filter.level = level;
  if (campus) filter.campus = { $regex: campus, $options: "i" };
  if (isFeatured === "true") filter.isFeatured = true;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "metadata.tags": { $regex: search, $options: "i" } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    rating: { averageRating: -1 },
    enrollmentCount: { enrollmentCount: -1 },
    createdAt: { createdAt: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };
  const sortOrder = sortMap[sort] ?? { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10))
  );
  const skip = (pageNum - 1) * limitNum;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("teachers", "firstName lastName avatar")
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Course.countDocuments(filter),
  ]);

  // Public listing — safe to cache at the CDN/proxy for 60 s
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  sendPaginated(
    res,
    courses,
    buildPaginationMeta(pageNum, limitNum, total),
    "Courses retrieved successfully"
  );
}

// ── GET /api/v1/courses/search?q=... ──────────────────────────────────────────
// NOTE: this handler must be mounted BEFORE /:id in the router
export async function searchCourses(req: Request, res: Response): Promise<void> {
  const { q, page = "1", limit = String(PAGINATION.DEFAULT_LIMIT) } =
    req.query as Record<string, string>;

  if (!q?.trim()) throw new BadRequestError('Query parameter "q" is required.');

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { isPublished: true, $text: { $search: q } };
  const projection = { score: { $meta: "textScore" } };

  const [courses, total] = await Promise.all([
    Course.find(filter, projection)
      .populate("teachers", "firstName lastName avatar")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Course.countDocuments(filter),
  ]);

  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");

  sendPaginated(
    res,
    courses,
    buildPaginationMeta(pageNum, limitNum, total),
    "Search results"
  );
}

// ── GET /api/v1/courses/:id ────────────────────────────────────────────────────
export async function getCourseById(req: Request, res: Response): Promise<void> {
  const course = await Course.findById(req.params.id).populate(
    "teachers",
    "firstName lastName email avatar role"
  );

  if (!course) throw new NotFoundError("Course");

  sendSuccess(res, { course });
}

// ── PATCH /api/v1/courses/:id ──────────────────────────────────────────────────
export async function updateCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // Strip system-managed counters that must never be directly set
  const {
    enrollmentCount: _ec,
    averageRating: _ar,
    totalReviews: _tr,
    ...safeFields
  } = req.body as Record<string, unknown>;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $set: safeFields },
    { new: true, runValidators: true }
  ).populate("teachers", "firstName lastName email avatar");

  if (!course) throw new NotFoundError("Course");

  sendSuccess(res, { course }, "Course updated successfully");
}

// ── DELETE /api/v1/courses/:id ─────────────────────────────────────────────────
export async function deleteCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const courseId = new Types.ObjectId(req.params.id);

  const course = await Course.findById(courseId);
  if (!course) throw new NotFoundError("Course");

  // Collect assignment IDs so submissions can be cascade-deleted
  const assignments = await Assignment.find({ courseId }, "_id").lean();
  const assignmentIds = assignments.map((a) => a._id);

  // Run all cascade deletes in parallel
  await Promise.all([
    Enrollment.deleteMany({ courseId }),
    Material.deleteMany({ courseId }),
    Assignment.deleteMany({ courseId }),
    Submission.deleteMany({ assignmentId: { $in: assignmentIds } }),
    Attendance.deleteMany({ courseId }),
    XPModel.deleteMany({ courseId }),
  ]);

  await course.deleteOne();

  sendSuccess(res, null, "Course and all related data deleted successfully");
}
