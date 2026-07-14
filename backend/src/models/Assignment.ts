/**
 * ============================================================================
 * QUESTIFY BACKEND MODEL: Assignment
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Holds student tasks (prompts, due dates, maximum points).
 * 
 * WHY IT EXISTS:
 * Allows teachers to outline coursework and evaluate student submissions.
 * 
 * HOW IT WORKS (Technical Overview):
 * Mongoose schema connected to course models, containing list references.
 * ============================================================================
 */

import { Schema, model, Document, Types, Model } from "mongoose";
import type { ISubmission } from "./Submission";

// ── Submission type enum ───────────────────────────────────────────────────────
export type SubmissionType = "TEXT" | "FILE" | "LINK" | "CODE";

// ── Assignment document interface ──────────────────────────────────────────────
export interface IAssignment extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  totalPoints: number;
  submissionType: SubmissionType;
  allowLateSubmission: boolean;
  /** Late-submission penalty as a percentage (0–100) */
  latePenalty: number;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  /** Virtual populate — available after .populate("submissions") */
  submissions?: ISubmission[];
}

// ── Static methods interface ───────────────────────────────────────────────────
export interface IAssignmentModel extends Model<IAssignment> {
  getActiveAssignments(
    courseId: Types.ObjectId | string
  ): Promise<IAssignment[]>;

  getOverdueAssignments(): Promise<IAssignment[]>;
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const AssignmentSchema = new Schema<IAssignment, IAssignmentModel>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "courseId is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2_000, "Description must be at most 2 000 characters"],
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [10_000, "Instructions must be at most 10 000 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 100,
      min: [1, "Total points must be at least 1"],
      max: [1_000, "Total points must be at most 1 000"],
    },
    submissionType: {
      type: String,
      enum: {
        values: ["TEXT", "FILE", "LINK", "CODE"] as SubmissionType[],
        message: "submissionType must be TEXT, FILE, LINK, or CODE",
      },
      required: [true, "submissionType is required"],
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenalty: {
      type: Number,
      default: 10,
      min: [0, "Late penalty cannot be negative"],
      max: [100, "Late penalty cannot exceed 100%"],
    },
    attachments: {
      type: [{ type: String, trim: true }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual populate: submissions ──────────────────────────────────────────────
AssignmentSchema.virtual("submissions", {
  ref: "Submission",
  localField: "_id",
  foreignField: "assignmentId",
});

// ── Static: assignments with dueDate in the future ────────────────────────────
AssignmentSchema.statics.getActiveAssignments = async function (
  courseId: Types.ObjectId | string
): Promise<IAssignment[]> {
  return Assignment.find({
    courseId: new Types.ObjectId(courseId.toString()),
    dueDate: { $gte: new Date() },
  }).sort({ dueDate: 1 });
};

// ── Static: all assignments past their dueDate (system-wide) ──────────────────
AssignmentSchema.statics.getOverdueAssignments = async function (): Promise<IAssignment[]> {
  return Assignment.find({ dueDate: { $lt: new Date() } }).sort({ dueDate: -1 });
};

// ── Indexes ────────────────────────────────────────────────────────────────────
// Course assignment listing
AssignmentSchema.index({ courseId: 1 });

// Due-date sorting / overdue queries
AssignmentSchema.index({ dueDate: 1 });

// Combined: course assignments ordered by due date
AssignmentSchema.index({ courseId: 1, dueDate: 1 });

export const Assignment = model<IAssignment, IAssignmentModel>(
  "Assignment",
  AssignmentSchema
);
