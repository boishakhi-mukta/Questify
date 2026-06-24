import { Schema, model, Document, Types } from "mongoose";

// ── Material type enum ─────────────────────────────────────────────────────────
export type MaterialType = "PDF" | "VIDEO" | "DOCUMENT" | "LINK" | "IMAGE" | "CODE";

// ── Document interface ─────────────────────────────────────────────────────────
export interface IMaterial extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description?: string;
  type: MaterialType;
  url: string;
  /** File size in bytes (0 for external links) */
  fileSize: number;
  uploadedBy: Types.ObjectId;
  /** Display order within the course */
  order: number;
  /** XP awarded when a student reads this material */
  xpReward: number;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const MaterialSchema = new Schema<IMaterial>(
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
      trim: true,
      maxlength: [1_000, "Description must be at most 1 000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "CODE"] as MaterialType[],
        message: "type must be PDF, VIDEO, DOCUMENT, LINK, IMAGE, or CODE",
      },
      required: [true, "type is required"],
    },
    url: {
      type: String,
      required: [true, "url is required"],
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
      min: [0, "fileSize cannot be negative"],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "uploadedBy is required"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "order cannot be negative"],
    },
    xpReward: {
      type: Number,
      default: 15,
      min: [0, "xpReward cannot be negative"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "views cannot be negative"],
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
// Course materials ordered by sequence
MaterialSchema.index({ courseId: 1, order: 1 });

// Filter by material type
MaterialSchema.index({ type: 1 });

export const Material = model<IMaterial>("Material", MaterialSchema);
