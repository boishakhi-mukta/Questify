import { Schema, model, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;   // ref: User
  courseId: Types.ObjectId;    // ref: Course
  enrolledAt: Date;
  /** Students can unenroll; we soft-delete to preserve XP history */
  isActive: boolean;
  unenrolledAt?: Date;
}

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
    enrolledAt: {
      type: Date,
      default: () => new Date(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unenrolledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Unique active enrollment — one student cannot enroll in the same course twice
EnrollmentSchema.index(
  { studentId: 1, courseId: 1 },
  {
    unique: true,
    name: "unique_active_enrollment",
  }
);
EnrollmentSchema.index({ courseId: 1, isActive: 1 });
EnrollmentSchema.index({ studentId: 1, isActive: 1 });

export const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);
