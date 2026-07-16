/**
 * ============================================================================
 * QUESTIFY BACKEND MODEL: Course
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Stores course records (titles, descriptions, levels, semesters, instructors).
 * 
 * WHY IT EXISTS:
 * Serves as the central entity connecting assignments, enrollments, and materials.
 * 
 * HOW IT WORKS (Technical Overview):
 * Mongoose schema with relationships linking courses to their instructor User models.
 * ============================================================================
 */

import { Schema, model, Document, Types } from "mongoose";

// ── Level enum ─────────────────────────────────────────────────────────────────
export type CourseLevel = "BACHELOR" | "MASTERS";

// ── Metadata sub-document ──────────────────────────────────────────────────────
export interface ICourseMetadata {
  objectives: string[];
  prerequisites: string[];
  tags: string[];
  syllabus?: string;
}

// ── Document interface ─────────────────────────────────────────────────────────
export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  level: CourseLevel;
  campus: string;
  credits: number;
  semester?: string;
  /** Assigned teachers — array of User ObjectIds */
  teachers: Types.ObjectId[];
  estimatedHours: number;
  language: string;
  imageUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  enrollmentCount: number;
  /** Maximum students allowed; used for enrollmentPercentage virtual */
  maxCapacity: number;
  averageRating: number;
  totalReviews: number;
  metadata: ICourseMetadata;
  createdAt: Date;
  updatedAt: Date;
  /** Virtual: (enrollmentCount / maxCapacity) × 100, clamped to 100 */
  readonly enrollmentPercentage: number;
}

// ── Metadata sub-schema ────────────────────────────────────────────────────────
const MetadataSchema = new Schema<ICourseMetadata>(
  {
    objectives: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    syllabus: {
      type: String,
      trim: true,
      maxlength: [10_000, "Syllabus must be at most 10 000 characters"],
    },
  },
  { _id: false }
);

// ── Course schema ──────────────────────────────────────────────────────────────
const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      unique: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [5_000, "Description must be at most 5 000 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, "Short description must be at most 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category must be at most 100 characters"],
    },
    level: {
      type: String,
      enum: {
        values: ["BACHELOR", "MASTERS"] as CourseLevel[],
        message: "Level must be BACHELOR or MASTERS",
      },
      required: [true, "Level is required"],
    },
    campus: {
      type: String,
      required: [true, "Campus is required"],
      trim: true,
      maxlength: [100, "Campus must be at most 100 characters"],
    },
    credits: {
      type: Number,
      default: 3,
      min: [0, "Credits cannot be negative"],
      max: [60, "Credits must be at most 60"],
    },
    semester: {
      type: String,
      trim: true,
      maxlength: [50, "Semester must be at most 50 characters"],
    },
    teachers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: [true, "At least one teacher is required"],
      validate: {
        validator: (ids: Types.ObjectId[]) => ids.length > 0,
        message: "At least one teacher must be assigned",
      },
    },
    estimatedHours: {
      type: Number,
      default: 40,
      min: [1, "Estimated hours must be at least 1"],
      max: [1_000, "Estimated hours must be at most 1 000"],
    },
    language: {
      type: String,
      default: "English",
      trim: true,
      maxlength: [50, "Language must be at most 50 characters"],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: [0, "Enrollment count cannot be negative"],
    },
    maxCapacity: {
      type: Number,
      default: 50,
      min: [1, "Max capacity must be at least 1"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },
    metadata: {
      type: MetadataSchema,
      default: () => ({ objectives: [], prerequisites: [], tags: [] }),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual ────────────────────────────────────────────────────────────────────
CourseSchema.virtual("enrollmentPercentage").get(function (
  this: ICourse
): number {
  if (this.maxCapacity <= 0) return 0;
  return Math.min(100, Math.round((this.enrollmentCount / this.maxCapacity) * 100));
});

// ── Indexes ────────────────────────────────────────────────────────────────────
// Full-text search on title + description
CourseSchema.index({ title: "text", description: "text", "metadata.tags": "text" });
// Filtering
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ campus: 1 });
// Teacher dashboard
CourseSchema.index({ teachers: 1 });
// Public listing
CourseSchema.index({ isPublished: 1, isFeatured: 1 });
// Pagination / sorting
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ averageRating: -1, enrollmentCount: -1 });

export const Course = model<ICourse>("Course", CourseSchema);
