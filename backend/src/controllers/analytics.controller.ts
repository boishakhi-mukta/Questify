/**
 * ============================================================================
 * QUESTIFY CONTROLLER: Analytics Controller
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Compiles performance trends, class attendance rates, and badge progress.
 * 
 * WHY IT EXISTS:
 * Feeds dashboards with charts and metrics.
 * 
 * HOW IT WORKS (Technical Overview):
 * Computes database aggregate values to return to clients.
 * ============================================================================
 */

import { Response } from "express";
import { Types, type PipelineStage } from "mongoose";
import { Course }      from "@/models/Course";
import { Enrollment }  from "@/models/Enrollment";
import { Submission }  from "@/models/Submission";
import { Attendance }  from "@/models/Attendance";
import { XPModel }     from "@/models/XP";
import { User }        from "@/models/User";
import { NotFoundError, AuthorizationError } from "@/utils/errors";
import { sendSuccess } from "@/utils/responses";
import type { AuthenticatedRequest } from "@/types";

// ── Shared helpers ─────────────────────────────────────────────────────────────

/** Returns a Date exactly `months` calendar months before now. */
function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

/**
 * Counts the current consecutive-day XP streak for a student.
 * A streak is active if the student had at least one XP event today or
 * yesterday (to survive across midnight).
 */
function calcStreak(descendingDates: string[]): number {
  if (descendingDates.length === 0) return 0;

  const toDay = (d: Date) => d.toISOString().split("T")[0];
  const today     = toDay(new Date());
  const yesterday = toDay(new Date(Date.now() - 86_400_000));

  if (descendingDates[0] !== today && descendingDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < descendingDates.length; i++) {
    const prev = new Date(descendingDates[i - 1]).getTime();
    const curr = new Date(descendingDates[i]).getTime();
    if (Math.round((prev - curr) / 86_400_000) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Private: shared user-analytics builder ─────────────────────────────────────
/**
 * Builds the full analytics payload for one user.
 * Called by both the student-self and admin-any handlers.
 */
async function buildUserAnalytics(userId: Types.ObjectId) {
  const twelveMonthsAgo = monthsAgo(12);

  const [
    enrollmentHistory,
    xpProgressByMonth,
    favoriteCategories,
    xpDays,
    totalXP,
    submissionStats,
  ] = await Promise.all([
    // Full enrollment history with course details
    Enrollment.find({ studentId: userId })
      .populate("course", "title category level campus semester imageUrl credits")
      .sort({ enrolledAt: -1 })
      .limit(100)
      .lean(),

    // Monthly XP earned over the last 12 months
    XPModel.aggregate<{ year: number; month: number; totalXP: number; events: number }>([
      { $match: { studentId: userId, earnedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id:     { year: { $year: "$earnedAt" }, month: { $month: "$earnedAt" } },
          totalXP: { $sum: "$points" },
          events:  { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", totalXP: 1, events: 1 } },
    ]),

    // Courses by category — ranked by enrollment count
    Enrollment.aggregate<{ category: string; count: number }>([
      { $match: { studentId: userId } },
      { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $group: { _id: "$course.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]),

    // Distinct activity dates for streak calculation
    XPModel.aggregate<{ date: string }>([
      { $match: { studentId: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$earnedAt" } },
        },
      },
      { $sort: { _id: -1 } },
      { $project: { _id: 0, date: "$_id" } },
    ]),

    // Lifetime total XP
    XPModel.aggregate<{ total: number }>([
      { $match: { studentId: userId } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]),

    // Submission overview — total submitted, graded, avg score
    Submission.aggregate<{ submitted: number; graded: number; avgScore: number }>([
      { $match: { studentId: userId } },
      {
        $group: {
          _id:      null,
          submitted: { $sum: 1 },
          graded:    { $sum: { $cond: [{ $eq: ["$status", "GRADED"] }, 1, 0] } },
          avgScore:  { $avg: { $cond: [{ $eq: ["$status", "GRADED"] }, "$score", null] } },
        },
      },
    ]),
  ]);

  const enrollmentSummary = {
    total:     enrollmentHistory.length,
    active:    enrollmentHistory.filter((e) => e.status === "ACTIVE").length,
    completed: enrollmentHistory.filter((e) => e.status === "COMPLETED").length,
    dropped:   enrollmentHistory.filter((e) => e.status === "DROPPED").length,
  };

  return {
    enrollmentHistory,
    enrollmentSummary,
    xpProgressByMonth,
    favoriteCategories,
    learningStreak: calcStreak(xpDays.map((d) => d.date)),
    totalXP: totalXP[0]?.total ?? 0,
    submissions: {
      total:    submissionStats[0]?.submitted  ?? 0,
      graded:   submissionStats[0]?.graded     ?? 0,
      avgScore: Math.round((submissionStats[0]?.avgScore ?? 0) * 10) / 10,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/analytics/course/:courseId  (Teacher/Admin)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCourseAnalytics(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.params;
  const courseOId = new Types.ObjectId(courseId);

  const course = await Course.findById(courseOId).lean();
  if (!course) throw new NotFoundError("Course");

  // Teachers must be assigned to the course; admins see all
  if (req.user!.role === "teacher") {
    const assigned = course.teachers.some((t) => t.toString() === req.user!.id);
    if (!assigned) throw new AuthorizationError("You are not assigned to this course.");
  }

  const [
    enrollmentTrend,
    enrollmentStatuses,
    topStudentsByXP,
    avgScoreResult,
    attendanceStats,
    xpByActivity,
    submissionRateResult,
  ] = await Promise.all([
    // Enrollments grouped by month
    Enrollment.aggregate<{ year: number; month: number; count: number }>([
      { $match: { courseId: courseOId } },
      {
        $group: {
          _id:   { year: { $year: "$enrolledAt" }, month: { $month: "$enrolledAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1 } },
    ]),

    // Status breakdown for completion / dropout rates
    Enrollment.aggregate<{ status: string; count: number }>([
      { $match: { courseId: courseOId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),

    // Top 10 students by XP in this course, with name
    Enrollment.find({ courseId: courseOId, status: { $in: ["ACTIVE", "COMPLETED"] } })
      .sort({ totalXpEarned: -1 })
      .limit(10)
      .populate<{ studentId: { _id: Types.ObjectId; firstName: string; lastName: string; email: string; avatar?: string } }>(
        "studentId", "firstName lastName email avatar"
      )
      .select("totalXpEarned progressPercentage status studentId")
      .lean(),

    // Average score on graded submissions for this course
    Submission.aggregate<{ avgScore: number; totalGraded: number }>([
      { $match: { courseId: courseOId, status: "GRADED" } },
      {
        $group: {
          _id:         null,
          avgScore:    { $avg: "$score" },
          totalGraded: { $sum: 1 },
        },
      },
    ]),

    // Attendance: total sessions, present count, and per-student rate
    Attendance.aggregate<{ totalSessions: number; totalPresent: number; uniqueStudents: number }>([
      { $match: { courseId: courseOId } },
      {
        $group: {
          _id:            null,
          totalSessions:  { $sum: 1 },
          totalPresent:   { $sum: { $cond: ["$present", 1, 0] } },
          uniqueStudents: { $addToSet: "$studentId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSessions:  1,
          totalPresent:   1,
          uniqueStudents: { $size: "$uniqueStudents" },
        },
      },
    ]),

    // XP awarded in this course broken down by activity type
    XPModel.aggregate<{ type: string; totalPoints: number; events: number }>([
      { $match: { courseId: courseOId } },
      {
        $group: {
          _id:         "$type",
          totalPoints: { $sum: "$points" },
          events:      { $sum: 1 },
        },
      },
      { $project: { _id: 0, type: "$_id", totalPoints: 1, events: 1 } },
      { $sort: { totalPoints: -1 } },
    ]),

    // Submission rate: distinct students who submitted / total enrolled
    Submission.aggregate<{ studentsSubmitted: number }>([
      { $match: { courseId: courseOId } },
      { $group: { _id: "$studentId" } },
      { $count: "studentsSubmitted" },
    ]),
  ]);

  // Derive rates from raw counts
  const statusMap = Object.fromEntries(
    enrollmentStatuses.map((s) => [s.status, s.count])
  );
  const totalEnrollments = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const completionRate = totalEnrollments > 0
    ? Math.round(((statusMap.COMPLETED ?? 0) / totalEnrollments) * 1000) / 10
    : 0;
  const dropoutRate = totalEnrollments > 0
    ? Math.round(((statusMap.DROPPED ?? 0) / totalEnrollments) * 1000) / 10
    : 0;

  const att = attendanceStats[0];
  const attendanceRate = att && att.totalSessions > 0
    ? Math.round((att.totalPresent / att.totalSessions) * 1000) / 10
    : 0;

  const studentsSubmitted = submissionRateResult[0]?.studentsSubmitted ?? 0;
  const activeEnrolled    = statusMap.ACTIVE ?? 0;
  const submissionRate    = activeEnrolled > 0
    ? Math.round((studentsSubmitted / activeEnrolled) * 1000) / 10
    : 0;

  sendSuccess(
    res,
    {
      course: { _id: course._id, title: course.title, campus: course.campus, semester: course.semester },
      enrollments: {
        total:         totalEnrollments,
        byStatus:      statusMap,
        completionRate,
        dropoutRate,
        trend:         enrollmentTrend,
      },
      performance: {
        avgScore:     Math.round((avgScoreResult[0]?.avgScore ?? 0) * 10) / 10,
        totalGraded:  avgScoreResult[0]?.totalGraded ?? 0,
      },
      topStudents: topStudentsByXP,
      engagement: {
        attendanceRate,
        submissionRate,
        xpByActivity,
      },
    },
    "Course analytics retrieved successfully"
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/analytics/user  (Student — self only)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getSelfAnalytics(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = new Types.ObjectId(req.user!.id);
  const data   = await buildUserAnalytics(userId);
  sendSuccess(res, data, "Your analytics retrieved successfully");
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/analytics/users/:userId  (Admin — any user)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getUserAnalytics(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { userId } = req.params;

  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("User");

  const data = await buildUserAnalytics(new Types.ObjectId(userId));
  sendSuccess(
    res,
    { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }, ...data },
    "User analytics retrieved successfully"
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/analytics/enrollments  (Admin)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getEnrollmentAnalytics(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const twelveMonthsAgo = monthsAgo(12);

  const [
    monthlyTrend,
    completionByCourse,
    statusCounts,
    timeToCompletionResult,
    semesterBreakdown,
  ] = await Promise.all([
    // Total enrollments per month for the last 12 months
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

    // Completion rate per course (top 20 by total enrollment)
    Enrollment.aggregate<{
      courseId: string;
      courseTitle: string;
      total: number;
      completed: number;
      completionRate: number;
    }>([
      {
        $group: {
          _id:       "$courseId",
          total:     { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 20 },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      {
        $project: {
          _id:            0,
          courseId:       { $toString: "$_id" },
          courseTitle:    "$course.title",
          campus:         "$course.campus",
          total:          1,
          completed:      1,
          completionRate: {
            $round: [{ $multiply: [{ $divide: ["$completed", "$total"] }, 100] }, 1],
          },
        },
      },
    ]),

    // Overall status breakdown for dropout rate
    Enrollment.aggregate<{ status: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),

    // Average calendar days from enrolledAt to completedAt
    Enrollment.aggregate<{ avgDays: number; sampleSize: number }>([
      { $match: { status: "COMPLETED", completedAt: { $exists: true } } },
      {
        $addFields: {
          daysToComplete: {
            $divide: [{ $subtract: ["$completedAt", "$enrolledAt"] }, 86_400_000],
          },
        },
      },
      {
        $group: {
          _id:        null,
          avgDays:    { $avg: "$daysToComplete" },
          sampleSize: { $sum: 1 },
        },
      },
      { $project: { _id: 0, avgDays: { $round: ["$avgDays", 1] }, sampleSize: 1 } },
    ]),

    // Enrollment counts grouped by semester
    Enrollment.aggregate<{ semester: string; count: number }>([
      { $match: { semester: { $exists: true, $ne: null } } },
      { $group: { _id: "$semester", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, semester: "$_id", count: 1 } },
    ]),
  ]);

  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s.count]));
  const grandTotal = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const dropoutRate = grandTotal > 0
    ? Math.round(((statusMap.DROPPED ?? 0) / grandTotal) * 1000) / 10
    : 0;

  const overallCompletionRate = grandTotal > 0
    ? Math.round(((statusMap.COMPLETED ?? 0) / grandTotal) * 1000) / 10
    : 0;

  sendSuccess(
    res,
    {
      overview: {
        total:                grandTotal,
        byStatus:             statusMap,
        overallCompletionRate,
        dropoutRate,
        avgTimeToCompletion:  timeToCompletionResult[0] ?? { avgDays: 0, sampleSize: 0 },
      },
      monthlyTrend,
      completionRateByCourse: completionByCourse,
      semesterBreakdown,
    },
    "Enrollment analytics retrieved successfully"
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/analytics/xp  (Admin)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getXPAnalytics(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.query as { courseId?: string };

  const scopeMatch: PipelineStage.Match = courseId
    ? { $match: { courseId: new Types.ObjectId(courseId) } }
    : { $match: {} };

  const twelveMonthsAgo = monthsAgo(12);

  const [
    totalByType,
    topEarners,
    xpByCourse,
    xpTrend,
    courseTotal,
  ] = await Promise.all([
    // Total XP and event count grouped by activity type
    XPModel.aggregate<{ type: string; totalPoints: number; events: number }>([
      scopeMatch,
      {
        $group: {
          _id:         "$type",
          totalPoints: { $sum: "$points" },
          events:      { $sum: 1 },
        },
      },
      { $project: { _id: 0, type: "$_id", totalPoints: 1, events: 1 } },
      { $sort: { totalPoints: -1 } },
    ]),

    // Top 20 most active students by XP
    XPModel.aggregate<{ studentId: string; name: string; email: string; totalXP: number; courses: number }>([
      scopeMatch,
      {
        $group: {
          _id:     "$studentId",
          totalXP: { $sum: "$points" },
          courses: { $addToSet: "$courseId" },
        },
      },
      { $sort: { totalXP: -1 } },
      { $limit: 20 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      {
        $project: {
          _id:       0,
          studentId: { $toString: "$_id" },
          name:      { $concat: ["$student.firstName", " ", "$student.lastName"] },
          email:     "$student.email",
          avatar:    "$student.avatar",
          totalXP:   1,
          courseCount: { $size: "$courses" },
        },
      },
    ]),

    // XP distribution across top 10 courses
    courseId
      ? [] // already scoped, per-course breakdown not useful
      : XPModel.aggregate<{ courseId: string; courseTitle: string; totalPoints: number; students: number }>([
          {
            $group: {
              _id:         "$courseId",
              totalPoints: { $sum: "$points" },
              students:    { $addToSet: "$studentId" },
            },
          },
          { $sort: { totalPoints: -1 } },
          { $limit: 10 },
          { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
          { $unwind: "$course" },
          {
            $project: {
              _id:         0,
              courseId:    { $toString: "$_id" },
              courseTitle: "$course.title",
              totalPoints: 1,
              students:    { $size: "$students" },
            },
          },
        ]),

    // Monthly XP trend for last 12 months
    XPModel.aggregate<{ year: number; month: number; totalPoints: number; events: number }>([
      { $match: { ...scopeMatch.$match, earnedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id:         { year: { $year: "$earnedAt" }, month: { $month: "$earnedAt" } },
          totalPoints: { $sum: "$points" },
          events:      { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", totalPoints: 1, events: 1 } },
    ]),

    // Grand total across scope
    XPModel.aggregate<{ total: number; events: number }>([
      scopeMatch,
      { $group: { _id: null, total: { $sum: "$points" }, events: { $sum: 1 } } },
    ]),
  ]);

  sendSuccess(
    res,
    {
      scope: courseId ? { courseId } : "all courses",
      summary: {
        totalXP:    courseTotal[0]?.total  ?? 0,
        totalEvents: courseTotal[0]?.events ?? 0,
      },
      totalXpAwardedByType:  totalByType,
      mostActiveStudents:    topEarners,
      xpDistributionByCourse: xpByCourse,
      xpTrend,
    },
    "XP analytics retrieved successfully"
  );
}

// ── GET /api/v1/analytics/leaderboard ─────────────────────────────────────────
/**
 * Global XP leaderboard accessible to all authenticated users.
 * Aggregates totalXpEarned across all active/completed enrollments.
 */
export async function getLeaderboard(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { limit = "50", timeframe } = req.query as {
    limit?: string;
    timeframe?: string;
  };

  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

  const dateFilter: Record<string, unknown> = {};
  if (timeframe === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dateFilter.updatedAt = { $gte: d };
  } else if (timeframe === "month") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    dateFilter.updatedAt = { $gte: d };
  }

  const entries = await Enrollment.aggregate<{
    studentId: string;
    name: string;
    avatar?: string;
    totalXP: number;
    courseCount: number;
  }>([
    { $match: { status: { $in: ["ACTIVE", "COMPLETED"] }, ...dateFilter } },
    {
      $group: {
        _id:         "$studentId",
        totalXP:     { $sum: "$totalXpEarned" },
        courseCount: { $sum: 1 },
      },
    },
    { $sort: { totalXP: -1 } },
    { $limit: limitNum },
    {
      $lookup: {
        from:         "users",
        localField:   "_id",
        foreignField: "_id",
        as:           "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id:         0,
        studentId:   { $toString: "$_id" },
        name:        { $concat: ["$user.firstName", " ", "$user.lastName"] },
        avatar:      "$user.avatar",
        totalXP:     1,
        courseCount: 1,
      },
    },
  ]);

  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));

  sendSuccess(res, ranked, "Leaderboard retrieved successfully");
}
