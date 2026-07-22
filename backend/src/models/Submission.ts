/**
 * ============================================================================
 * QUESTIFY BACKEND MODEL: Submission
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Holds work student submit, along with instructor feedback and grades.
 * 
 * WHY IT EXISTS:
 * Keeps historical records of student coursework, feedback, and grading.
 * 
 * HOW IT WORKS (Technical Overview):
 * Connects Assignment, Course, and Student IDs, storing submission files/text.
 * ============================================================================
 */

import { Schema, model, Document, Types } from "mongoose";
import { XPModel } from "./XP";

// ── Status enum ────────────────────────────────────────────────────────────────
export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE";

// ── Document interface ─────────────────────────────────────────────────────────
export interface ISubmission extends Document {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  /** Denormalized for XP and leaderboard queries without an extra join */
  courseId: Types.ObjectId;
  /** Text or code answer */
  submissionContent?: string;
  /** File URL for FILE-type assignments */
  fileUrl?: string;
  submittedAt: Date;
  status: SubmissionStatus;
  /** Teacher-assigned score (0–100); absent until GRADED */
  score?: number;
  feedback?: string;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: [true, "assignmentId is required"],
      index: true,
    },
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
    },
    submissionContent: {
      type: String,
      trim: true,
      maxlength: [50_000, "Submission content must be at most 50 000 characters"],
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["SUBMITTED", "GRADED", "LATE"] as SubmissionStatus[],
        message: "status must be SUBMITTED, GRADED, or LATE",
      },
      default: "SUBMITTED",
    },
    score: {
      type: Number,
      min: [0, "score cannot be negative"],
      max: [100, "score cannot exceed 100"],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2_000, "Feedback must be at most 2 000 characters"],
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ── Post-save: award XP when submission is graded ─────────────────────────────
// Runs automatically right after a submission is saved. Once a teacher grades
// it, this awards the student XP (engagement points) for having submitted it —
// the duplicate-prevention index below stops it from being awarded twice.
SubmissionSchema.post("save", async function (doc: ISubmission) {
  if (doc.status !== "GRADED") return;

  // Idempotency index on metadata.submissionId absorbs duplicate-award attempts
  await XPModel.create({
    studentId: doc.studentId,
    courseId: doc.courseId,
    type: "ASSIGNMENT_SUBMISSION",
    metadata: { submissionId: doc._id },
  }).catch(() => undefined);
});

// ── Indexes ────────────────────────────────────────────────────────────────────
// One submission per student per assignment
SubmissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true, name: "unique_submission" }
);

// All submissions for an assignment
SubmissionSchema.index({ assignmentId: 1 });

// All submissions by a student
SubmissionSchema.index({ studentId: 1 });

// Teacher grading queue
SubmissionSchema.index({ status: 1 });

export const Submission = model<ISubmission>("Submission", SubmissionSchema);
