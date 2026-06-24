import { Schema, model, Document, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  level: "Bachelor" | "Master" | "PhD";
  campus: string;
  category: string;
  credits: number;
  semester: string;
  /** Array of User._id references for assigned teachers */
  teacherIds: Types.ObjectId[];
  /** Whether the course is currently accepting enrollments */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    level: {
      type: String,
      enum: {
        values: ["Bachelor", "Master", "PhD"],
        message: "Level must be Bachelor, Master, or PhD",
      },
      required: [true, "Level is required"],
    },
    campus: {
      type: String,
      required: [true, "Campus is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be at least 1"],
      max: [60, "Credits must be at most 60"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    teacherIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
CourseSchema.index({ level: 1, category: 1 });
CourseSchema.index({ teacherIds: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ title: "text", description: "text" }); // full-text search

export const Course = model<ICourse>("Course", CourseSchema);
