/**
 * ============================================================================
 * QUESTIFY BACKEND MODEL: User
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Defines user accounts, roles (Admin, Teacher, Student), credentials, and gamified XP.
 * 
 * WHY IT EXISTS:
 * Stores account login information, identity parameters, and engagement metrics.
 * 
 * HOW IT WORKS (Technical Overview):
 * Mongoose schema using bcrypt password hashing hooks and Clerk ID fields.
 * ============================================================================
 */

import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "@/config/environment";
import type { UserRole } from "@/types";

// ── Sub-document interface ────────────────────────────────────────────────────
export interface IUserProfile {
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks: string[];
  educationLevel?: string;
  /** Department code, e.g. "CS" — matches Department.code */
  department?: string;
}

// ── Document interface ────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  /** bcrypt hash — never expose; select: false keeps it out of queries by default */
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  profile: IUserProfile;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  /** Clerk user ID — populated when admin creates user via Clerk sync */
  clerkId?: string;
  /** True when the account was created by admin with a temp password — cleared after first change */
  requiresPasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Virtual — "firstName lastName" */
  readonly fullName: string;
  /** Compare a plain-text candidate against the stored hash */
  comparePassword(plainPassword: string): Promise<boolean>;
}

// ── Profile sub-schema ────────────────────────────────────────────────────────
const ProfileSchema = new Schema<IUserProfile>(
  {
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must be at most 500 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location must be at most 100 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Phone number is invalid"],
    },
    socialLinks: {
      type: [String],
      default: [],
      validate: {
        validator: (links: string[]) => links.length <= 10,
        message: "A maximum of 10 social links are allowed",
      },
    },
    educationLevel: {
      type: String,
      trim: true,
      maxlength: [100, "Education level must be at most 100 characters"],
    },
    department: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, "Department code must be at most 20 characters"],
    },
  },
  { _id: false }
);

// ── User schema ───────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email must be at most 254 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [1, "First name must be at least 1 character"],
      maxlength: [50, "First name must be at most 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name must be at least 1 character"],
      maxlength: [50, "Last name must be at most 50 characters"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "teacher", "student"] as UserRole[],
        message: "Role must be admin, teacher, or student",
      },
      default: "student",
      required: [true, "Role is required"],
    },
    profile: {
      type: ProfileSchema,
      default: () => ({ socialLinks: [] }),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    clerkId: {
      type:   String,
      sparse: true,
    },
    requiresPasswordChange: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        (ret as Record<string, unknown>).passwordHash = undefined;
        delete (ret as Record<string, unknown>).id; // remove duplicate of _id
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Virtual ───────────────────────────────────────────────────────────────────
// A computed field (not stored in the database) that joins first + last name
// together for convenience, e.g. "Jane Doe".
UserSchema.virtual("fullName").get(function (this: IUser): string {
  return `${this.firstName} ${this.lastName}`;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isActive: 1, role: 1 });

// ── Pre-save hook ─────────────────────────────────────────────────────────────
// Runs automatically right before a user record is saved. If the password
// was just set or changed, it scrambles (hashes) it before it touches the
// database — so the plain-text password is never actually stored anywhere.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  // At this point passwordHash holds the plain-text password — hash it in place
  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
// Lets the login process check "does the password this person typed match
// what's stored for their account" without ever un-scrambling the stored hash.
UserSchema.methods.comparePassword = function (
  this: IUser,
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

export const User = model<IUser>("User", UserSchema);
