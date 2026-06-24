import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "../types";

export interface IUser extends Document {
  _id: Types.ObjectId;
  userId: string;      // Human-readable ID (e.g. "student01") — unique
  name: string;
  email: string;
  password: string;    // bcrypt hash — NEVER store plain text
  role: UserRole;
  avatar?: string;     // URL to profile image
  createdAt: Date;
  updatedAt: Date;
  /** Instance method — compare a plain-text candidate against the stored hash */
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      unique: true,
      trim: true,
      minlength: [3, "userId must be at least 3 characters"],
      maxlength: [30, "userId must be at most 30 characters"],
      match: [/^[a-zA-Z0-9_-]+$/, "userId may only contain letters, numbers, underscores and hyphens"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,   // Never return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "teacher", "student"],
        message: "Role must be admin, teacher, or student",
      },
      required: [true, "Role is required"],
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // Strip sensitive fields from all JSON serialisations
        (ret as Record<string, unknown>).password = undefined;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ role: 1 });
UserSchema.index({ email: 1 });

// ── Hooks ────────────────────────────────────────────────────────────────────
/** Hash password before every save/update that modifies it */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

export const User = model<IUser>("User", UserSchema);
