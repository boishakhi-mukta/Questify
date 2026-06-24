import { Schema, model, Document, Types, Model, type PipelineStage } from "mongoose";
import { Enrollment } from "./Enrollment";
import type { LeaderboardEntry } from "@/types";

// ── Activity type enum + point map ─────────────────────────────────────────────
export type XPActivityType =
  | "ATTENDANCE"
  | "ASSIGNMENT_SUBMISSION"
  | "MATERIAL_READ"
  | "PARTICIPATION"
  | "QUIZ";

export const XP_POINT_VALUES: Record<XPActivityType, number> = {
  ATTENDANCE: 10,
  ASSIGNMENT_SUBMISSION: 25,
  MATERIAL_READ: 15,
  PARTICIPATION: 5,
  QUIZ: 20,
};

// ── Metadata sub-document interface ───────────────────────────────────────────
export interface IXPMetadata {
  attendanceId?: Types.ObjectId;
  assignmentId?: Types.ObjectId;
  submissionId?: Types.ObjectId;
  description?: string;
}

// ── Document interface ─────────────────────────────────────────────────────────
export interface IXP extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  type: XPActivityType;
  /** Points awarded — auto-set from XP_POINT_VALUES[type] on creation */
  points: number;
  metadata: IXPMetadata;
  earnedAt: Date;
  createdAt: Date;
}

// ── Static methods interface ───────────────────────────────────────────────────
export interface IXPModel extends Model<IXP> {
  calculateLeaderboard(
    courseId: Types.ObjectId | string
  ): Promise<LeaderboardEntry[]>;

  getUserPoints(
    studentId: Types.ObjectId | string,
    courseId: Types.ObjectId | string
  ): Promise<number>;
}

// ── Metadata sub-schema ────────────────────────────────────────────────────────
const MetadataSchema = new Schema<IXPMetadata>(
  {
    attendanceId: { type: Schema.Types.ObjectId, ref: "Attendance" },
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
    submissionId: { type: Schema.Types.ObjectId },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
    },
  },
  { _id: false }
);

// ── XP schema ──────────────────────────────────────────────────────────────────
const XPSchema = new Schema<IXP, IXPModel>(
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
    type: {
      type: String,
      enum: {
        values: Object.keys(XP_POINT_VALUES) as XPActivityType[],
        message: `type must be one of: ${Object.keys(XP_POINT_VALUES).join(", ")}`,
      },
      required: [true, "type is required"],
    },
    points: {
      type: Number,
      required: [true, "points is required"],
      min: [1, "points must be at least 1"],
    },
    metadata: {
      type: MetadataSchema,
      default: () => ({}),
    },
    earnedAt: {
      type: Date,
      default: () => new Date(),
      required: [true, "earnedAt is required"],
    },
  },
  {
    // No updatedAt — this is an immutable event ledger
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

// ── Pre-validate: auto-set points from type ────────────────────────────────────
XPSchema.pre("validate", function (next) {
  if (this.isNew && this.type) {
    this.points = XP_POINT_VALUES[this.type];
  }
  next();
});

// ── Post-save: increment Enrollment.totalXpEarned ─────────────────────────────
XPSchema.post("save", async function (doc: IXP) {
  if (!this.isNew) return;

  await Enrollment.findOneAndUpdate(
    { studentId: doc.studentId, courseId: doc.courseId },
    { $inc: { totalXpEarned: doc.points } }
  );
});

// ── Static: leaderboard for a course ──────────────────────────────────────────
XPSchema.statics.calculateLeaderboard = async function (
  courseId: Types.ObjectId | string
): Promise<LeaderboardEntry[]> {
  const pipeline: PipelineStage[] = [
    { $match: { courseId: new Types.ObjectId(courseId.toString()) } },
    { $group: { _id: "$studentId", totalXP: { $sum: "$points" } } },
    { $sort: { totalXP: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "studentData",
      },
    },
    { $unwind: "$studentData" },
    {
      $project: {
        _id: 0,
        studentId: { $toString: "$_id" },
        name: {
          $concat: ["$studentData.firstName", " ", "$studentData.lastName"],
        },
        avatar: "$studentData.avatar",
        totalXP: 1,
      },
    },
  ];

  const results = await XPModel.aggregate<Omit<LeaderboardEntry, "rank">>(pipeline);

  return results.map((entry, index) => ({ ...entry, rank: index + 1 }));
};

// ── Static: total points for a student in a course ────────────────────────────
XPSchema.statics.getUserPoints = async function (
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
    { $group: { _id: null, total: { $sum: "$points" } } },
  ];

  const result = await XPModel.aggregate<{ total: number }>(pipeline);

  return result[0]?.total ?? 0;
};

// ── Indexes ────────────────────────────────────────────────────────────────────
// Per-student totals for leaderboard
XPSchema.index({ courseId: 1, studentId: 1 });

// Course-wide leaderboard (sorted by points already in Enrollment, but useful for direct XP queries)
XPSchema.index({ courseId: 1, points: -1 });

// Student's XP history across all courses
XPSchema.index({ studentId: 1, earnedAt: -1 });

// Analytics by activity type
XPSchema.index({ type: 1 });

// Time-series queries
XPSchema.index({ earnedAt: -1 });

// Idempotency: prevent double-awarding the same attendance event
XPSchema.index(
  { studentId: 1, "metadata.attendanceId": 1, type: 1 },
  { unique: true, sparse: true, name: "unique_attendance_xp" }
);

// Idempotency: prevent double-awarding the same submission
XPSchema.index(
  { studentId: 1, "metadata.submissionId": 1, type: 1 },
  { unique: true, sparse: true, name: "unique_submission_xp" }
);

export const XPModel = model<IXP, IXPModel>("XP", XPSchema);
