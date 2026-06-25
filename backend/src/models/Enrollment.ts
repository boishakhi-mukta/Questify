import { Schema, model, Document, Types } from "mongoose";
import type { ICourse } from "./Course";
import type { IUser } from "./User";

// ── Status enum ────────────────────────────────────────────────────────────────
export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

// ── Document interface ─────────────────────────────────────────────────────────
export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: EnrollmentStatus;
  semester?: string;
  enrolledAt: Date;
  completedAt?: Date;
  totalXpEarned: number;
  progressPercentage: number;
  lastAccessedAt: Date;
  certificateIssued: boolean;
  certificateUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  /** Virtual populate — available after .populate("course") */
  course?: ICourse;
  /** Virtual populate — available after .populate("student") */
  student?: IUser;
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const EnrollmentSchema = new Schema<IEnrollment>(
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
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "COMPLETED", "DROPPED"] as EnrollmentStatus[],
        message: "Status must be ACTIVE, COMPLETED, or DROPPED",
      },
      default: "ACTIVE",
    },
    semester: {
      type: String,
      trim: true,
      maxlength: [50, "Semester must be at most 50 characters"],
    },
    enrolledAt: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    completedAt: {
      type: Date,
    },
    totalXpEarned: {
      type: Number,
      default: 0,
      min: [0, "totalXpEarned cannot be negative"],
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be below 0"],
      max: [100, "Progress cannot exceed 100"],
    },
    lastAccessedAt: {
      type: Date,
      default: () => new Date(),
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1_000, "Notes must be at most 1 000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Pre-save: stamp lastAccessedAt on every write ─────────────────────────────
EnrollmentSchema.pre("save", function (next) {
  this.lastAccessedAt = new Date();

  // Auto-stamp completedAt when status transitions to COMPLETED
  if (this.isModified("status") && this.status === "COMPLETED" && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// ── Virtual populate ───────────────────────────────────────────────────────────
EnrollmentSchema.virtual("course", {
  ref: "Course",
  localField: "courseId",
  foreignField: "_id",
  justOne: true,
});

EnrollmentSchema.virtual("student", {
  ref: "User",
  localField: "studentId",
  foreignField: "_id",
  justOne: true,
});

// ── Indexes ────────────────────────────────────────────────────────────────────
// Prevent duplicate enrollment: one student per course
EnrollmentSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true, name: "unique_enrollment" }
);

// Leaderboard: top XP earners per course
EnrollmentSchema.index({ courseId: 1, totalXpEarned: -1 });

// Student dashboard: all enrollments for a student, newest first
EnrollmentSchema.index({ studentId: 1, enrolledAt: -1 });

// Admin / teacher filtering by status
EnrollmentSchema.index({ status: 1 });

// Sorting by enrollment date
EnrollmentSchema.index({ enrolledAt: -1 });

export const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);
