import { Response } from "express";
import { Types } from "mongoose";
import { Course } from "@/models/Course";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { Enrollment } from "@/models/Enrollment";
import { NotFoundError, AuthorizationError, BadRequestError } from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION } from "@/config/constants";
import type { AuthenticatedRequest } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Ensures the calling user has edit rights over the given course.
 * Admins bypass the assignment check; teachers must be listed in course.teachers.
 */
async function assertCourseAccess(
  courseId: Types.ObjectId | string,
  userId: string,
  role: string
): Promise<void> {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");

  if (role === "teacher") {
    const assigned = course.teachers.some((t) => t.toString() === userId);
    if (!assigned) {
      throw new AuthorizationError("You are not assigned to this course.");
    }
  }
}

function logAction(
  action: string,
  details: Record<string, unknown>
): void {
  console.log(
    JSON.stringify({ action, ...details, timestamp: new Date().toISOString() })
  );
}

// ── POST /api/v1/assignments ───────────────────────────────────────────────────
export async function createAssignment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.body as { courseId: string };

  await assertCourseAccess(courseId, req.user!.id, req.user!.role);

  const assignment = await Assignment.create(req.body);

  logAction("ASSIGNMENT_CREATED", {
    assignmentId: assignment._id.toString(),
    courseId,
    createdBy: req.user!.id,
    title: assignment.title,
    dueDate: assignment.dueDate.toISOString(),
    submissionType: assignment.submissionType,
  });

  sendCreated(res, { assignment }, "Assignment created successfully");
}

// ── GET /api/v1/assignments/course/:courseId ───────────────────────────────────
export async function getCourseAssignments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.params;
  const { page = "1", limit = String(PAGINATION.DEFAULT_LIMIT) } =
    req.query as Record<string, string>;

  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");

  // Students: must be enrolled
  if (req.user!.role === "student") {
    const enrolled = await Enrollment.findOne({
      studentId: req.user!.id,
      courseId,
      status: "ACTIVE",
    }).lean();
    if (!enrolled) {
      throw new AuthorizationError("You are not enrolled in this course.");
    }
  }

  // Teachers: must be assigned (admins pass through)
  if (req.user!.role === "teacher") {
    const assigned = course.teachers.some(
      (t) => t.toString() === req.user!.id
    );
    if (!assigned) {
      throw new AuthorizationError("You are not assigned to this course.");
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10))
  );
  const skip = (pageNum - 1) * limitNum;

  const filter = { courseId: new Types.ObjectId(courseId) };

  const [assignments, total] = await Promise.all([
    Assignment.find(filter)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Assignment.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    assignments,
    buildPaginationMeta(pageNum, limitNum, total),
    "Assignments retrieved successfully"
  );
}

// ── GET /api/v1/assignments/:id ────────────────────────────────────────────────
export async function getAssignmentById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new NotFoundError("Assignment");

  const role = req.user!.role;

  // Access control
  if (role === "student") {
    const enrolled = await Enrollment.findOne({
      studentId: req.user!.id,
      courseId: assignment.courseId,
      status: "ACTIVE",
    }).lean();
    if (!enrolled) {
      throw new AuthorizationError("You are not enrolled in this course.");
    }
  }

  if (role === "teacher") {
    const course = await Course.findById(assignment.courseId).lean();
    if (!course) throw new NotFoundError("Course");
    const assigned = course.teachers.some((t) => t.toString() === req.user!.id);
    if (!assigned) {
      throw new AuthorizationError("You are not assigned to this course.");
    }
  }

  // Build role-aware response
  const data: Record<string, unknown> = { assignment };

  if (role === "teacher" || role === "admin") {
    data.submissionCount = await Submission.countDocuments({
      assignmentId: assignment._id,
    });
  }

  if (role === "student") {
    const mySubmission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: req.user!.id,
    }).lean();
    data.mySubmission = mySubmission ?? null;
  }

  sendSuccess(res, data, "Assignment retrieved successfully");
}

// ── PATCH /api/v1/assignments/:id ──────────────────────────────────────────────
export async function updateAssignment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new NotFoundError("Assignment");

  await assertCourseAccess(assignment.courseId, req.user!.id, req.user!.role);

  // courseId is immutable — moving an assignment to another course
  // requires delete + create to keep data consistency.
  const { courseId: _c, ...safeFields } = req.body as Record<string, unknown>;

  const updated = await Assignment.findByIdAndUpdate(
    assignment._id,
    { $set: safeFields },
    { new: true, runValidators: true }
  );

  logAction("ASSIGNMENT_UPDATED", {
    assignmentId: assignment._id.toString(),
    courseId: assignment.courseId.toString(),
    updatedBy: req.user!.id,
    fields: Object.keys(safeFields),
  });

  sendSuccess(res, { assignment: updated }, "Assignment updated successfully");
}

// ── DELETE /api/v1/assignments/:id ─────────────────────────────────────────────
/**
 * Hard-deletes the assignment but intentionally leaves submissions intact.
 * The Assignment model has no soft-delete field; submissions are kept for
 * grading records and audit trails.
 */
export async function deleteAssignment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new NotFoundError("Assignment");

  await assertCourseAccess(assignment.courseId, req.user!.id, req.user!.role);

  await assignment.deleteOne();

  logAction("ASSIGNMENT_DELETED", {
    assignmentId: req.params.id,
    courseId: assignment.courseId.toString(),
    title: assignment.title,
    deletedBy: req.user!.id,
  });

  sendSuccess(
    res,
    null,
    "Assignment deleted. Submissions have been preserved for record keeping."
  );
}

// ── POST /api/v1/assignments/:id/extend-deadline ───────────────────────────────
export async function extendDeadline(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new NotFoundError("Assignment");

  await assertCourseAccess(assignment.courseId, req.user!.id, req.user!.role);

  const { newDueDate, reason } = req.body as {
    newDueDate: string;
    reason?: string;
  };

  const newDate = new Date(newDueDate);
  if (newDate <= assignment.dueDate) {
    throw new BadRequestError(
      "newDueDate must be strictly after the current due date."
    );
  }

  const updated = await Assignment.findByIdAndUpdate(
    assignment._id,
    { $set: { dueDate: newDate } },
    { new: true, runValidators: true }
  );

  logAction("ASSIGNMENT_DEADLINE_EXTENDED", {
    assignmentId: assignment._id.toString(),
    courseId: assignment.courseId.toString(),
    extendedBy: req.user!.id,
    previousDueDate: assignment.dueDate.toISOString(),
    newDueDate: newDate.toISOString(),
    reason: reason ?? "Not specified",
  });

  sendSuccess(res, { assignment: updated }, "Deadline extended successfully");
}
