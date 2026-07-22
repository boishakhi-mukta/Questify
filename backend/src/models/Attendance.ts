/**
 * ============================================================================
 * QUESTIFY BACKEND MODEL: Attendance
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Tracks student daily attendance (present, absent, late).
 * 
 * WHY IT EXISTS:
 * Records attendance and rewards students with XP for showing up.
 * 
 * HOW IT WORKS (Technical Overview):
 * Maps Course IDs, Student IDs, dates, and attendance flags.
 * ============================================================================
 */

import { Schema, model, Document, Types, Model, type PipelineStage } from "mongoose";
import { XPModel } from "./XP";

// ── Document interface ─────────────────────────────────────────────────────────
export interface IAttendance extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  /** Class date (stored as Date; time component is ignored) */
  date: Date;
  present: boolean;
  /** Teacher who marked this record */
  markedBy: Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Static methods interface ───────────────────────────────────────────────────
export interface IAttendanceModel extends Model<IAttendance> {
  getStudentAttendance(
    studentId: Types.ObjectId | string,
    courseId: Types.ObjectId | string
  ): Promise<IAttendance[]>;

  getAttendanceRate(
    studentId: Types.ObjectId | string,
    courseId: Types.ObjectId | string
  ): Promise<number>;
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const AttendanceSchema = new Schema<IAttendance, IAttendanceModel>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "studentId is required"],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "courseId is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "date is required"],
      index: true,
    },
    present: {
      type: Boolean,
      required: [true, "present is required"],
      default: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "markedBy is required"],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks must be at most 500 characters"],
    },
  },
  { timestamps: true }
);

// ── Post-save: award attendance XP on first save when present ──────────────────
// Runs automatically right after a new attendance record is saved. If the
// student was marked present, this awards them attendance XP (engagement
// points) — but only the first time, never for later edits to the same record.
AttendanceSchema.post("save", async function (doc: IAttendance) {
  if (!this.isNew || !doc.present) return;

  // Idempotency index on metadata.attendanceId silently absorbs duplicate attempts
  await XPModel.create({
    studentId: doc.studentId,
    courseId: doc.courseId,
    type: "ATTENDANCE",
    metadata: { attendanceId: doc._id },
  }).catch(() => undefined);
});

// ── Static: all attendance records for a student in a course ──────────────────
// Fetches a student's full attendance history for one course, most recent day first.
AttendanceSchema.statics.getStudentAttendance = async function (
  studentId: Types.ObjectId | string,
  courseId: Types.ObjectId | string
): Promise<IAttendance[]> {
  return Attendance.find({
    studentId: new Types.ObjectId(studentId.toString()),
    courseId: new Types.ObjectId(courseId.toString()),
  }).sort({ date: -1 });
};

// ── Static: attendance rate (0–100) for a student in a course ─────────────────
// Calculates what percentage of classes a student has attended in a course —
// e.g. 85 means they showed up to 85% of sessions.
AttendanceSchema.statics.getAttendanceRate = async function (
  studentId: Types.ObjectId | string,
  courseId: Types.ObjectId | string
): Promise<number> {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        studentId: new Types.ObjectId(studentId.toString()),
        courseId: new Types.ObjectId(courseId.toString()),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: ["$present", 1, 0] } },
      },
    },
  ];

  const result = await Attendance.aggregate<{ total: number; present: number }>(pipeline);
  if (!result[0] || result[0].total === 0) return 0;

  return Math.round((result[0].present / result[0].total) * 100);
};

// ── Indexes ────────────────────────────────────────────────────────────────────
// Prevent duplicate: one record per student per course per date
AttendanceSchema.index(
  { studentId: 1, courseId: 1, date: 1 },
  { unique: true, name: "unique_attendance_record" }
);

// Attendance reports: all students for a course on a given date
AttendanceSchema.index({ courseId: 1, date: 1 });

// Student attendance history within a course
AttendanceSchema.index({ studentId: 1, courseId: 1 });

export const Attendance = model<IAttendance, IAttendanceModel>(
  "Attendance",
  AttendanceSchema
);
