import { Response } from "express";
import { Types } from "mongoose";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { BadRequestError, ConflictError, NotFoundError, AuthorizationError } from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION, ERROR_CODES } from "@/config/constants";
import type { AuthenticatedRequest } from "@/types";

// ── Helper ─────────────────────────────────────────────────────────────────────
function logAction(action: string, details: Record<string, unknown>): void {
  console.log(
    JSON.stringify({ action, ...details, timestamp: new Date().toISOString() })
  );
}

// ── POST /api/v1/enrollments ───────────────────────────────────────────────────
/**
 * Creates a new enrollment for the calling student.
 * If a previous DROPPED enrollment exists the student is re-activated
 * rather than creating a second document (the compound unique index prevents it).
 */
export async function enrollStudent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.body as { courseId: string };
  const studentId = req.user!.id;

  // ── 1. Course must exist and be published ───────────────────────────────────
  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");
  if (!course.isPublished) {
    throw new BadRequestError("This course is not open for enrollment.");
  }

  // ── 2. Capacity check ───────────────────────────────────────────────────────
  if (course.enrollmentCount >= course.maxCapacity) {
    throw new BadRequestError(
      `Course is full (${course.maxCapacity} / ${course.maxCapacity} seats taken).`
    );
  }

  // ── 3. Duplicate check ──────────────────────────────────────────────────────
  const existing = await Enrollment.findOne({ studentId, courseId }).lean();

  if (existing) {
    if (existing.status === "ACTIVE") {
      throw new ConflictError(
        "You are already enrolled in this course.",
        ERROR_CODES.ALREADY_ENROLLED
      );
    }
    if (existing.status === "COMPLETED") {
      throw new ConflictError(
        "You have already completed this course.",
        ERROR_CODES.ALREADY_ENROLLED
      );
    }

    // status === "DROPPED" — re-activate the existing record
    const reactivated = await Enrollment.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          status: "ACTIVE",
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        },
        $unset: { completedAt: "" },
      },
      { new: true, runValidators: true }
    );

    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    logAction("STUDENT_RE_ENROLLED", {
      studentId,
      courseId,
      enrollmentId: existing._id.toString(),
    });

    sendCreated(res, { enrollment: reactivated }, "Re-enrolled successfully");
    return;
  }

  // ── 4. Create new enrollment ────────────────────────────────────────────────
  const enrollment = await Enrollment.create({
    studentId: new Types.ObjectId(studentId),
    courseId: new Types.ObjectId(courseId),
  });

  // Increment atomically — safe because we already passed the capacity check above
  await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

  logAction("STUDENT_ENROLLED", {
    studentId,
    courseId,
    enrollmentId: enrollment._id.toString(),
  });

  sendCreated(res, { enrollment }, "Enrolled successfully");
}

// ── DELETE /api/v1/enrollments/:id ────────────────────────────────────────────
/**
 * Soft-deletes an enrollment by setting status to DROPPED.
 * Also decrements the course enrollmentCount so the seat is freed.
 */
export async function unenrollStudent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw new NotFoundError("Enrollment");

  // Students can only drop their own enrollments
  if (enrollment.studentId.toString() !== req.user!.id) {
    throw new AuthorizationError("You can only unenroll from your own enrollments.");
  }

  if (enrollment.status === "DROPPED") {
    throw new BadRequestError("You are not currently enrolled in this course.");
  }
  if (enrollment.status === "COMPLETED") {
    throw new BadRequestError("Cannot unenroll from a completed course.");
  }

  await enrollment.updateOne({ $set: { status: "DROPPED" } });

  // Decrement but floor at 0 to guard against stale counter state
  await Course.findByIdAndUpdate(enrollment.courseId, {
    $inc: { enrollmentCount: -1 },
  });

  logAction("STUDENT_UNENROLLED", {
    studentId: req.user!.id,
    courseId: enrollment.courseId.toString(),
    enrollmentId: enrollment._id.toString(),
  });

  sendSuccess(res, null, "Unenrolled successfully");
}

// ── GET /api/v1/enrollments ────────────────────────────────────────────────────
/**
 * Admin: filter by any courseId and/or studentId.
 * Teacher: auto-restricted to courses they teach; optional courseId filter
 * must be one of their courses.
 */
export async function getEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    courseId,
    studentId,
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const role = req.user!.role;
  const filter: Record<string, unknown> = {};

  if (role === "teacher") {
    // Resolve the courses this teacher owns
    const taughtCourses = await Course.find(
      { teachers: new Types.ObjectId(req.user!.id) },
      "_id"
    ).lean();
    const taughtIds = taughtCourses.map((c) => c._id);

    if (courseId) {
      const requested = new Types.ObjectId(courseId);
      if (!taughtIds.some((id) => id.equals(requested))) {
        throw new AuthorizationError("You are not assigned to this course.");
      }
      filter.courseId = requested;
    } else {
      filter.courseId = { $in: taughtIds };
    }
  } else {
    // Admin may filter freely
    if (courseId) filter.courseId = new Types.ObjectId(courseId);
    if (studentId) filter.studentId = new Types.ObjectId(studentId);
  }

  if (status) filter.status = status;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "firstName lastName email avatar")
      .populate("course", "title category level imageUrl")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    enrollments,
    buildPaginationMeta(pageNum, limitNum, total),
    "Enrollments retrieved successfully"
  );
}

// ── GET /api/v1/enrollments/my ────────────────────────────────────────────────
/**
 * Returns the calling student's active and completed enrollments,
 * with full course details, XP earned, and progress.
 */
export async function getStudentEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
    status,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {
    studentId: new Types.ObjectId(req.user!.id),
    // Default: hide dropped unless explicitly requested
    status: status ?? { $in: ["ACTIVE", "COMPLETED"] },
  };

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate(
        "course",
        "title shortDescription category level imageUrl credits campus semester estimatedHours"
      )
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    enrollments,
    buildPaginationMeta(pageNum, limitNum, total),
    "Your enrollments retrieved successfully"
  );
}

// ── GET /api/v1/enrollments/teaching ─────────────────────────────────────────
/**
 * Returns enrollments for all courses the calling teacher is assigned to.
 * An optional ?courseId query parameter narrows to a single course
 * (must be one the teacher owns).
 */
export async function getTeacherEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    courseId,
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Resolve courses taught by this teacher
  const taughtCourses = await Course.find(
    { teachers: new Types.ObjectId(req.user!.id) },
    "_id title"
  ).lean();

  if (taughtCourses.length === 0) {
    sendPaginated(
      res,
      [],
      buildPaginationMeta(pageNum, limitNum, 0),
      "No courses assigned"
    );
    return;
  }

  const taughtIds = taughtCourses.map((c) => c._id);

  const filter: Record<string, unknown> = {
    courseId: { $in: taughtIds },
  };

  if (courseId) {
    const requested = new Types.ObjectId(courseId);
    if (!taughtIds.some((id) => id.equals(requested))) {
      throw new AuthorizationError("You are not assigned to this course.");
    }
    filter.courseId = requested;
  }

  if (status) filter.status = status;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "firstName lastName email avatar")
      .populate("course", "title category level")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Enrollment.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    enrollments,
    buildPaginationMeta(pageNum, limitNum, total),
    "Teaching enrollments retrieved successfully"
  );
}

// ── PATCH /api/v1/enrollments/:id/progress ────────────────────────────────────
/**
 * Allows a teacher to update a student's progress percentage for a course.
 * The teacher must be assigned to the course this enrollment belongs to.
 */
export async function updateEnrollmentProgress(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw new NotFoundError("Enrollment");

  if (enrollment.status !== "ACTIVE") {
    throw new BadRequestError(
      "Progress can only be updated for active enrollments."
    );
  }

  // Verify teacher teaches the course this enrollment belongs to
  const course = await Course.findById(enrollment.courseId).lean();
  if (!course) throw new NotFoundError("Course");

  const assigned = course.teachers.some((t) => t.toString() === req.user!.id);
  if (!assigned) {
    throw new AuthorizationError("You are not assigned to this course.");
  }

  const { progressPercentage } = req.body as { progressPercentage: number };

  const updated = await Enrollment.findByIdAndUpdate(
    enrollment._id,
    {
      $set: {
        progressPercentage,
        // Auto-complete when 100% is reached
        ...(progressPercentage >= 100
          ? { status: "COMPLETED", completedAt: new Date() }
          : {}),
      },
    },
    { new: true, runValidators: true }
  );

  logAction("ENROLLMENT_PROGRESS_UPDATED", {
    enrollmentId: enrollment._id.toString(),
    studentId: enrollment.studentId.toString(),
    courseId: enrollment.courseId.toString(),
    updatedBy: req.user!.id,
    progressPercentage,
    autoCompleted: progressPercentage >= 100,
  });

  sendSuccess(
    res,
    { enrollment: updated },
    progressPercentage >= 100
      ? "Progress updated — course marked as completed"
      : "Progress updated successfully"
  );
}
