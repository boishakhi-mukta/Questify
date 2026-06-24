import { Response } from "express";
import { Types } from "mongoose";
import { Course } from "@/models/Course";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { Enrollment } from "@/models/Enrollment";
import { XP_POINT_VALUES } from "@/models/XP";
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
import type { AuthenticatedRequest } from "@/types";

// ── Shared helpers ─────────────────────────────────────────────────────────────

function logAction(action: string, details: Record<string, unknown>): void {
  console.log(
    JSON.stringify({ action, ...details, timestamp: new Date().toISOString() })
  );
}

function parsePagination(page = "1", limit = String(PAGINATION.DEFAULT_LIMIT)) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
}

/**
 * Asserts the calling teacher is assigned to the given course.
 * Admins bypass the check. Throws AuthorizationError on failure.
 */
async function assertTeacherCourseAccess(
  courseId: Types.ObjectId | string,
  userId: string,
  role: string
): Promise<void> {
  if (role === "admin") return;

  const course = await Course.findById(courseId, "teachers").lean();
  if (!course) throw new NotFoundError("Course");

  const assigned = course.teachers.some((t) => t.toString() === userId);
  if (!assigned) {
    throw new AuthorizationError("You are not assigned to this course.");
  }
}

// ── POST /api/v1/submissions ──────────────────────────────────────────────────
/**
 * Student submits an assignment.
 *
 * Guards:
 * - Student must be actively enrolled in the assignment's course
 * - Duplicate submission → 409
 * - Past deadline + late not allowed → 400
 * - Content must match the assignment's submissionType
 *
 * Status is set to "LATE" when the submission arrives after dueDate
 * and the assignment has allowLateSubmission enabled.
 */
export async function submitAssignment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { assignmentId, submissionContent, fileUrl } = req.body as {
    assignmentId: string;
    submissionContent?: string;
    fileUrl?: string;
  };

  // ── 1. Assignment must exist ────────────────────────────────────────────────
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new NotFoundError("Assignment");

  // ── 2. Student must be actively enrolled ───────────────────────────────────
  const enrollment = await Enrollment.findOne({
    studentId: new Types.ObjectId(studentId),
    courseId: assignment.courseId,
    status: "ACTIVE",
  }).lean();
  if (!enrollment) {
    throw new AuthorizationError(
      "You must be actively enrolled in this course to submit."
    );
  }

  // ── 3. Deadline check ───────────────────────────────────────────────────────
  const now = new Date();
  const isPastDeadline = now > assignment.dueDate;

  if (isPastDeadline && !assignment.allowLateSubmission) {
    throw new BadRequestError(
      "The submission deadline has passed and late submissions are not accepted for this assignment."
    );
  }

  // ── 4. Content must match submissionType ───────────────────────────────────
  const type = assignment.submissionType;
  if ((type === "TEXT" || type === "CODE") && !submissionContent) {
    throw new BadRequestError(
      `submissionContent is required for ${type} assignments.`
    );
  }
  if (type === "FILE" && !fileUrl) {
    throw new BadRequestError("fileUrl is required for FILE assignments.");
  }
  if (type === "LINK" && !submissionContent) {
    throw new BadRequestError(
      "submissionContent (the URL) is required for LINK assignments."
    );
  }

  // ── 5. Duplicate submission check ──────────────────────────────────────────
  const existing = await Submission.findOne({ assignmentId, studentId }).lean();
  if (existing) {
    throw new ConflictError(
      "You have already submitted this assignment.",
      ERROR_CODES.DUPLICATE_SUBMISSION
    );
  }

  // ── 6. Create submission ───────────────────────────────────────────────────
  const status = isPastDeadline ? "LATE" : "SUBMITTED";

  const submission = await Submission.create({
    assignmentId: new Types.ObjectId(assignmentId),
    studentId: new Types.ObjectId(studentId),
    courseId: assignment.courseId,
    submissionContent,
    fileUrl,
    status,
  });

  logAction("ASSIGNMENT_SUBMITTED", {
    studentId,
    assignmentId,
    submissionId: submission._id.toString(),
    courseId: assignment.courseId.toString(),
    status,
    isLate: isPastDeadline,
    latePenaltyPct: isPastDeadline ? assignment.latePenalty : 0,
  });

  sendCreated(
    res,
    { submission },
    isPastDeadline
      ? `Assignment submitted late (${assignment.latePenalty}% penalty applies)`
      : "Assignment submitted successfully"
  );
}

// ── GET /api/v1/submissions/assignment/:assignmentId (Teacher/Admin) ──────────
/**
 * Returns all submissions for a given assignment, sorted by submittedAt.
 * Teacher must be assigned to the assignment's course.
 */
export async function getSubmissions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { assignmentId } = req.params;
  const {
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new NotFoundError("Assignment");

  await assertTeacherCourseAccess(
    assignment.courseId,
    req.user!.id,
    req.user!.role
  );

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter: Record<string, unknown> = {
    assignmentId: new Types.ObjectId(assignmentId),
  };
  if (status) filter.status = status;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate("studentId", "firstName lastName email avatar")
      .sort({ submittedAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    submissions,
    buildPaginationMeta(pageNum, limitNum, total),
    "Submissions retrieved successfully"
  );
}

// ── GET /api/v1/submissions/:id (Student/Teacher/Admin) ───────────────────────
/**
 * Returns a single submission.
 *
 * Authorization:
 * - Student: may only view their own submission
 * - Teacher: must be assigned to the submission's course
 * - Admin: unrestricted
 */
export async function getSubmissionById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const submission = await Submission.findById(req.params.id)
    .populate("studentId", "firstName lastName email avatar")
    .populate("assignmentId", "title dueDate totalPoints submissionType allowLateSubmission latePenalty")
    .lean();

  if (!submission) throw new NotFoundError("Submission");

  const { id: callerId, role } = req.user!;

  if (role === "student") {
    if (submission.studentId.toString() !== callerId) {
      throw new AuthorizationError("You can only view your own submissions.");
    }
  }

  if (role === "teacher") {
    await assertTeacherCourseAccess(
      submission.courseId,
      callerId,
      role
    );
  }

  sendSuccess(res, { submission }, "Submission retrieved successfully");
}

// ── PATCH /api/v1/submissions/:id/grade (Teacher/Admin) ───────────────────────
/**
 * Teacher grades a submission.
 *
 * Sets status → GRADED, records score/feedback/gradedBy/gradedAt.
 * Uses document.save() (not findByIdAndUpdate) so the Submission model's
 * post-save hook fires and awards 25 XP to the student automatically.
 * The XP unique-sparse index makes re-grading idempotent (no double XP).
 */
export async function gradeSubmission(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const submission = await Submission.findById(req.params.id);
  if (!submission) throw new NotFoundError("Submission");

  await assertTeacherCourseAccess(
    submission.courseId,
    req.user!.id,
    req.user!.role
  );

  const { score, feedback } = req.body as {
    score: number;
    feedback?: string;
  };

  const wasAlreadyGraded = submission.status === "GRADED";

  // Mutate and save so the Submission post-save hook triggers XP award
  submission.score     = score;
  submission.feedback  = feedback;
  submission.status    = "GRADED";
  submission.gradedBy  = new Types.ObjectId(req.user!.id);
  submission.gradedAt  = new Date();

  await submission.save();

  logAction("SUBMISSION_GRADED", {
    submissionId: submission._id.toString(),
    assignmentId: submission.assignmentId.toString(),
    studentId:    submission.studentId.toString(),
    courseId:     submission.courseId.toString(),
    gradedBy:     req.user!.id,
    score,
    wasAlreadyGraded,
    xpAwarded: wasAlreadyGraded ? 0 : XP_POINT_VALUES.ASSIGNMENT_SUBMISSION,
  });

  sendSuccess(
    res,
    {
      submission,
      xpAwarded: wasAlreadyGraded ? 0 : XP_POINT_VALUES.ASSIGNMENT_SUBMISSION,
    },
    wasAlreadyGraded
      ? "Submission re-graded successfully"
      : `Submission graded — ${XP_POINT_VALUES.ASSIGNMENT_SUBMISSION} XP awarded to student`
  );
}

// ── GET /api/v1/submissions/my (Student) ─────────────────────────────────────
/**
 * Returns the calling student's submission history.
 * Optional filters: ?courseId, ?assignmentId, ?status
 */
export async function getStudentSubmissions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const {
    courseId,
    assignmentId,
    status,
    page = "1",
    limit = String(PAGINATION.DEFAULT_LIMIT),
  } = req.query as Record<string, string>;

  const { pageNum, limitNum, skip } = parsePagination(page, limit);
  const filter: Record<string, unknown> = {
    studentId: new Types.ObjectId(studentId),
  };

  if (courseId)      filter.courseId      = new Types.ObjectId(courseId);
  if (assignmentId)  filter.assignmentId  = new Types.ObjectId(assignmentId);
  if (status)        filter.status        = status;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate("assignmentId", "title dueDate totalPoints submissionType")
      .populate("courseId", "title")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    submissions,
    buildPaginationMeta(pageNum, limitNum, total),
    "Your submissions retrieved successfully"
  );
}
