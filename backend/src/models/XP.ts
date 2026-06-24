import { Schema, model, Document, Types } from "mongoose";
import type { PointType } from "../types";

/** One XP record per earning event — append-only ledger */
export interface IXP extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;  // ref: User
  courseId: Types.ObjectId;   // ref: Course
  /** The activity that earned this XP */
  pointType: PointType;
  /** Points earned in this event (positive integer) */
  xpEarned: number;
  /** Optional reference to the source document (attendanceId, submissionId, etc.) */
  sourceId?: Types.ObjectId;
  timestamp: Date;
}

const XPSchema = new Schema<IXP>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "studentId is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "courseId is required"],
    },
    pointType: {
      type: String,
      enum: {
        values: ["attendance", "assignment", "reading"],
        message: "pointType must be attendance, assignment, or reading",
      },
      required: [true, "pointType is required"],
    },
    xpEarned: {
      type: Number,
      required: [true, "xpEarned is required"],
      min: [1, "xpEarned must be at least 1"],
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    // No updatedAt — this is an immutable event ledger
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Leaderboard query: total XP per student per course
XPSchema.index({ courseId: 1, studentId: 1 });
// Student profile: all XP across all courses
XPSchema.index({ studentId: 1, timestamp: -1 });
// Prevent double-awarding the same event
XPSchema.index(
  { studentId: 1, sourceId: 1, pointType: 1 },
  { unique: true, sparse: true, name: "unique_xp_event" }
);

export const XP = model<IXP>("XP", XPSchema);
