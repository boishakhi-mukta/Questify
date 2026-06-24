import { Schema, model, Document, Types } from "mongoose";

export type MaterialType = "pdf" | "video" | "link" | "slides";

export interface IMaterial extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;   // ref: Course
  title: string;
  description?: string;
  type: MaterialType;
  /** Public URL to access the resource */
  url: string;
  /** File size in bytes (0 for external links) */
  fileSizeBytes: number;
  uploadedBy: Types.ObjectId; // ref: User (teacher)
  /** Track which students have opened/read this material */
  readBy: Types.ObjectId[];   // ref: User[]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
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
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["pdf", "video", "link", "slides"],
        message: "type must be pdf, video, link, or slides",
      },
      required: [true, "type is required"],
    },
    url: {
      type: String,
      required: [true, "url is required"],
      trim: true,
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
      min: [0, "fileSizeBytes cannot be negative"],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "uploadedBy is required"],
    },
    readBy: {
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
MaterialSchema.index({ courseId: 1, isActive: 1 });
MaterialSchema.index({ courseId: 1, type: 1 });
// Fast check: has this student read this material (for +15 XP award)?
MaterialSchema.index({ readBy: 1 });

export const Material = model<IMaterial>("Material", MaterialSchema);
