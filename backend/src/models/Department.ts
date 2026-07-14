/**
 * ============================================================================
 * QUESTIFY BACKEND MODEL: Department
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Defines academic categories (e.g. Computer Science, Math).
 * 
 * WHY IT EXISTS:
 * Groups courses under specific academic sectors.
 * 
 * HOW IT WORKS (Technical Overview):
 * Schema with unique name keys and description strings.
 * ============================================================================
 */

import { Schema, model, Document, Types } from "mongoose";

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  /** Short uppercase code, e.g. "CS". Used to match Course.campus. */
  code: string;
  description?: string;
  /** Faculty member who leads the department */
  head?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Name must be at most 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "Code must be at most 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ isActive: 1 });

export const Department = model<IDepartment>("Department", DepartmentSchema);
