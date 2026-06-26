import { Response } from "express";
import { Types, type PipelineStage } from "mongoose";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { User } from "@/models/User";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  AuthorizationError,
} from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION, ERROR_CODES } from "@/config/constants";
import { logAction } from "@/utils/logger";
import type { AuthenticatedRequest } from "@/types";

function parsePagination(page = "1", limit = String(PAGINATION.DEFAULT_LIMIT)) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT SELF-SERVICE  (/api/v1/my-enrollments)
// studentId is always derived from req.user — never accepted from the request body
// ═══════════════════════════════════════════════════════════════════════════════

// ── POST /api/v1/my-enrollments/enroll ────────────────────────────────────────
/**
 * Student self-enrolls in a course.
 * Re-activates a previously DROPPED enrollment instead of creating a duplicate.
 * semester is auto-copied from the course record so admin filters work.
 */
export async function selfEnroll(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { courseId } = req.body as { courseId: string };

  // Course must exist and be published
  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");
  if (!course.isPublished) {
    throw new BadRequestError("This course is not available for enrollment.");
  }

  // Capacity check
  if (course.enrollmentCount >= course.maxCapacity) {
    throw new BadRequestError(
      `Course is at full capacity (${course.maxCapacity} seats).`
    );
  }

  // Duplicate check — re-activate DROPPED if found
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

    // Re-activate previously DROPPED enrollment
    const reactivated = await Enrollment.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          status: "ACTIVE",
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
          semester: course.semester,
        },
        $unset: { completedAt: "" },
      },
      { new: true, runValidators: true }
    );

    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    logAction("STUDENT_ENROLLED", {
      studentId,
      courseId,
      courseTitle: course.title,
      enrollmentId: existing._id.toString(),
      note: "re-activated dropped enrollment",
    });

    sendCreated(res, { enrollment: reactivated }, "Enrolled successfully");
    return;
  }

  // Create new enrollment — semester copied from course so filter queries work
  const enrollment = await Enrollment.create({
    studentId: new Types.ObjectId(studentId),
    courseId: new Types.ObjectId(courseId),
    semester: course.semester,
    totalXpEarned: 0,
  });

  await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

  logAction("STUDENT_ENROLLED", {
    studentId,
    courseId,
    courseTitle: course.title,
    enrollmentId: enrollment._id.toString(),
  });

  sendCreated(res, { enrollment }, "Enrolled successfully");
}

// ── GET /api/v1/my-enrollments ────────────────────────────────────────────────
/**
 * Returns the calling student's enrollments with course details.
 * Defaults to ACTIVE and COMPLETED; pass ?status=DROPPED to include drops.
 */
export async function getMyEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);

  const filter: Record<string, unknown> = {
    studentId: new Types.ObjectId(req.user!.id),
    status: status ?? { $in: ["ACTIVE", "COMPLETED"] },
  };

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate({
        path: "courseId",
        select: "title shortDescription semester category level credits campus estimatedHours imageUrl teachers",
        populate: { path: "teachers", select: "firstName lastName avatar" },
      })
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

// ── GET /api/v1/my-enrollments/:courseId ─────────────────────────────────────
/**
 * Returns the calling student's enrollment for a specific course.
 * 404 if the student is not enrolled (or has never been enrolled).
 */
export async function getMyEnrollmentByCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.params;

  const enrollment = await Enrollment.findOne({
    studentId: new Types.ObjectId(req.user!.id),
    courseId: new Types.ObjectId(courseId),
  })
    .populate({
      path: "course",
      select: "title shortDescription semester category level credits campus estimatedHours imageUrl teachers metadata",
      populate: { path: "teachers", select: "firstName lastName email avatar" },
    })
    .lean();

  if (!enrollment) {
    throw new NotFoundError("Enrollment");
  }

  sendSuccess(res, { enrollment }, "Enrollment retrieved successfully");
}

// ── DELETE /api/v1/my-enrollments/:enrollmentId ───────────────────────────────
/**
 * Student soft-drops their own enrollment (sets status to DROPPED).
 * Record is kept for analytics. XP history is preserved.
 * The enrollmentCount on the course is decremented.
 */
export async function selfUnenroll(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const enrollment = await Enrollment.findById(req.params.enrollmentId)
    .populate<{ course: { title: string } }>("course", "title");

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

  await Course.findByIdAndUpdate(enrollment.courseId, {
    $inc: { enrollmentCount: -1 },
  });

  logAction("STUDENT_UNENROLLED", {
    studentId: req.user!.id,
    courseId: enrollment.courseId.toString(),
    courseTitle: enrollment.course?.title,
    enrollmentId: enrollment._id.toString(),
  });

  sendSuccess(res, null, "Unenrolled successfully");
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT  (/api/v1/enrollments)
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /api/v1/enrollments ───────────────────────────────────────────────────
/**
 * Admin: list all enrollments with optional filters.
 * Filters: courseId, studentId, semester, status.
 */
export async function listEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    courseId,
    studentId,
    semester,
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter: Record<string, unknown> = {};

  if (courseId)  filter.courseId  = new Types.ObjectId(courseId);
  if (studentId) filter.studentId = new Types.ObjectId(studentId);
  if (semester)  filter.semester  = semester;
  if (status)    filter.status    = status;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "firstName lastName email role avatar")
      .populate("course", "title category level semester")
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

// ── GET /api/v1/enrollments/course/:courseId ──────────────────────────────────
/**
 * Admin: all enrollments for a given course.
 * Supports free-text search across student name and email via aggregation.
 */
export async function getCourseEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.params;
  const {
    status,
    search,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const baseFilter: Record<string, unknown> = {
    courseId: new Types.ObjectId(courseId),
  };
  if (status) baseFilter.status = status;

  if (search) {
    const pipeline: PipelineStage[] = [
      { $match: baseFilter },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $match: {
          $or: [
            { "student.firstName": { $regex: search, $options: "i" } },
            { "student.lastName":  { $regex: search, $options: "i" } },
            { "student.email":     { $regex: search, $options: "i" } },
          ],
        },
      },
      { $sort: { enrolledAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                studentId: 1, courseId: 1, status: 1, semester: 1,
                enrolledAt: 1, totalXpEarned: 1, progressPercentage: 1,
                "student._id": 1, "student.firstName": 1,
                "student.lastName": 1, "student.email": 1,
                "student.role": 1, "student.avatar": 1,
              },
            },
          ],
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
      "Course enrollments retrieved successfully"
    );
    return;
  }

  const [enrollments, total] = await Promise.all([
    Enrollment.find(baseFilter)
      .populate("student", "firstName lastName email role avatar")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Enrollment.countDocuments(baseFilter),
  ]);

  sendPaginated(
    res,
    enrollments,
    buildPaginationMeta(pageNum, limitNum, total),
    "Course enrollments retrieved successfully"
  );
}

// ── GET /api/v1/enrollments/student/:studentId ────────────────────────────────
/**
 * Admin: view a specific student's full enrollment history.
 */
export async function getStudentEnrollmentsAdmin(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { studentId } = req.params;
  const {
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const student = await User.findById(studentId).lean();
  if (!student) throw new NotFoundError("Student");

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter: Record<string, unknown> = {
    studentId: new Types.ObjectId(studentId),
  };
  if (status) filter.status = status;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("course", "title semester category level credits")
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
    "Student enrollments retrieved successfully"
  );
}

// ── PATCH /api/v1/enrollments/:id ────────────────────────────────────────────
/**
 * Admin updates an enrollment's status only.
 * studentId and courseId are immutable.
 */
export async function adminUpdateEnrollment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw new NotFoundError("Enrollment");

  const { status } = req.body as { status: "ACTIVE" | "COMPLETED" | "DROPPED" };
  const prevStatus = enrollment.status;

  const updates: Record<string, unknown> = { status };

  // Auto-stamp completedAt when transitioning to COMPLETED
  if (status === "COMPLETED" && prevStatus !== "COMPLETED") {
    updates.completedAt = new Date();
  }

  const updated = await Enrollment.findByIdAndUpdate(
    enrollment._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  logAction("ADMIN_UPDATED_ENROLLMENT", {
    adminId:      req.user!.id,
    adminName:    req.user!.name,
    enrollmentId: enrollment._id.toString(),
    studentId:    enrollment.studentId.toString(),
    courseId:     enrollment.courseId.toString(),
    prevStatus,
    newStatus:    status,
  });

  sendSuccess(res, { enrollment: updated }, "Enrollment updated successfully");
}

// ── DELETE /api/v1/enrollments/:id ───────────────────────────────────────────
/**
 * Admin soft-drops any enrollment.
 * Status is set to DROPPED; the record is retained for analytics.
 * Decrements the course's enrollmentCount.
 */
export async function adminDropEnrollment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate<{ course: { title: string } }>("course", "title");

  if (!enrollment) throw new NotFoundError("Enrollment");

  if (enrollment.status === "DROPPED") {
    throw new BadRequestError("Enrollment is already in DROPPED status.");
  }

  await enrollment.updateOne({ $set: { status: "DROPPED" } });

  await Course.findByIdAndUpdate(enrollment.courseId, {
    $inc: { enrollmentCount: -1 },
  });

  logAction("ADMIN_DROPPED_ENROLLMENT", {
    adminId:      req.user!.id,
    adminName:    req.user!.name,
    enrollmentId: enrollment._id.toString(),
    studentId:    enrollment.studentId.toString(),
    courseId:     enrollment.courseId.toString(),
    courseTitle:  enrollment.course?.title,
  });

  sendSuccess(res, null, "Enrollment dropped successfully");
}
