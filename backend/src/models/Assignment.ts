import { Schema, model, Document, Types } from "mongoose";

/** Embedded submission sub-document */
export interface ISubmission {
  studentId: Types.ObjectId;  // ref: User
  submittedAt: Date;
  /** URL to the submitted file (S3, Cloudinary, etc.) or text answer */
  fileUrl?: string;
  textAnswer?: string;
  /** Teacher-assigned grade (0-100), null until graded */
  grade?: number;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;  // ref: User (teacher)
  feedback?: string;
}

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;   // ref: Course
  title: string;
  description: string;
  dueDate: Date;
  /** Max file size in MB */
  maxFileSizeMb: number;
  /** Allowed MIME types */
  allowedTypes: string[];
  /** Uploaded by a teacher */
  uploadedBy: Types.ObjectId; // ref: User
  submissions: ISubmission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
    },
    fileUrl: { type: String, trim: true },
    textAnswer: { type: String, trim: true },
    grade: {
      type: Number,
      min: [0, "Grade cannot be negative"],
      max: [100, "Grade cannot exceed 100"],
    },
    gradedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
    feedback: { type: String, trim: true },
  },
  { _id: false } // embedded sub-document — no separate _id needed
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "courseId is required"],
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
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    maxFileSizeMb: {
      type: Number,
      default: 10,
      min: [1, "Max file size must be at least 1 MB"],
    },
    allowedTypes: {
      type: [String],
      default: ["application/pdf", "application/zip", "text/plain"],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "uploadedBy is required"],
    },
    submissions: {
      type: [SubmissionSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
AssignmentSchema.index({ courseId: 1, dueDate: 1 });
AssignmentSchema.index({ courseId: 1, isActive: 1 });
// Fast lookup: has this student already submitted?
AssignmentSchema.index({ "submissions.studentId": 1 });

export const Assignment = model<IAssignment>("Assignment", AssignmentSchema);
