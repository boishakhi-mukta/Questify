import { Request } from "express";
import { Types } from "mongoose";

// ── Re-exports from models (type-only — zero runtime cost) ─────────────────────
export type { IUser } from "../models/User";
export type { ICourse } from "../models/Course";
export type { IEnrollment } from "../models/Enrollment";
export type { IXP as IXPPoint } from "../models/XP";
export type { IAttendance } from "../models/Attendance";
export type { IAssignment, ISubmission } from "../models/Assignment";
export type { IMaterial, MaterialType } from "../models/Material";

// ── Primitive domain types ─────────────────────────────────────────────────────
export type UserRole = "admin" | "teacher" | "student";
export type IUserRole = UserRole;

export type PointType = "attendance" | "assignment" | "reading";

export type MongoId = Types.ObjectId;

// ── JWT ────────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ── Auth request bodies ────────────────────────────────────────────────────────
export interface RegisterBody {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
  avatar?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

// ── Augmented Express Request ──────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    name: string;
  };
}

// ── API response envelope ──────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationMeta;
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// ── Common query filters ───────────────────────────────────────────────────────
export interface CourseQuery extends PaginationQuery {
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category?: string;
  campus?: string;
  search?: string;
  isPublished?: string;
  isFeatured?: string;
  teachers?: string;
}

export interface XPLeaderboardQuery extends PaginationQuery {
  courseId?: string;
}

// ── Leaderboard entry ──────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatar?: string;
  totalXP: number;
}
