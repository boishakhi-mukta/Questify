import mongoose from "mongoose";
import request from "supertest";
import app from "@/app";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import type { IUser } from "@/models/User";
import type { ICourse } from "@/models/Course";
import type { IEnrollment } from "@/models/Enrollment";
import type { UserRole } from "@/types";

// ── Default test passwords (meet strength requirements) ───────────────────────
export const TEST_PASSWORD = "TestPass@123";

// ── User factory ───────────────────────────────────────────────────────────────

export interface CreateUserOpts {
  email?:     string;
  firstName?: string;
  lastName?:  string;
  role?:      UserRole;
  password?:  string;
  isActive?:  boolean;
}

/**
 * Creates a User document directly in the test DB.
 * The User pre-save hook hashes the password automatically.
 */
export async function createUser(opts: CreateUserOpts = {}): Promise<IUser> {
  const email = opts.email ?? `test-${Date.now()}@questify.test`;
  const user = new User({
    email,
    firstName: opts.firstName ?? "Test",
    lastName:  opts.lastName  ?? "User",
    role:      opts.role      ?? "student",
    passwordHash: opts.password ?? TEST_PASSWORD, // hook hashes this
    isActive:  opts.isActive ?? true,
  });
  return user.save();
}

export async function createAdmin(opts: CreateUserOpts = {}): Promise<IUser> {
  return createUser({ ...opts, role: "admin" });
}

export async function createTeacher(opts: CreateUserOpts = {}): Promise<IUser> {
  return createUser({ ...opts, role: "teacher" });
}

export async function createStudent(opts: CreateUserOpts = {}): Promise<IUser> {
  return createUser({ ...opts, role: "student" });
}

// ── Course factory ─────────────────────────────────────────────────────────────

export interface CreateCourseOpts {
  title?:       string;
  description?: string;
  category?:    string;
  campus?:      string;
  teachers?:    mongoose.Types.ObjectId[];
  isPublished?: boolean;
  maxCapacity?: number;
}

export async function createCourse(opts: CreateCourseOpts = {}): Promise<ICourse> {
  const course = new Course({
    title:       opts.title       ?? `Test Course ${Date.now()}`,
    description: opts.description ?? "A course created by the test suite for integration testing purposes.",
    category:    opts.category    ?? "Technology",
    level:       "BEGINNER",
    campus:      opts.campus      ?? "TEST",
    credits:     3,
    teachers:    opts.teachers    ?? [],
    maxCapacity: opts.maxCapacity ?? 50,
    estimatedHours: 40,
    isPublished: opts.isPublished ?? true,
    enrollmentCount: 0,
  });
  return course.save();
}

// ── Enrollment factory ─────────────────────────────────────────────────────────

export async function createEnrollment(
  studentId: mongoose.Types.ObjectId,
  courseId:  mongoose.Types.ObjectId
): Promise<IEnrollment> {
  const enrollment = new Enrollment({
    studentId,
    courseId,
    status:    "ACTIVE",
    enrolledAt: new Date(),
  });
  return enrollment.save();
}

// ── Auth helpers ───────────────────────────────────────────────────────────────

export interface LoginResult {
  accessToken:  string;
  refreshToken: string;
  user:         Record<string, unknown>;
}

/**
 * Logs in a user via the HTTP API and returns the access token.
 * Use this in integration tests to get a real JWT.
 */
export async function loginUser(email: string, password = TEST_PASSWORD): Promise<LoginResult> {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(
      `Login failed for ${email}: ${res.status} — ${JSON.stringify(res.body)}`
    );
  }

  return {
    accessToken:  res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    user:         res.body.data.user,
  };
}

/**
 * Creates a user + immediately logs them in.
 * Returns the user document and the access token.
 */
export async function createAndLogin(opts: CreateUserOpts = {}): Promise<{
  user:        IUser;
  accessToken: string;
}> {
  const password = opts.password ?? TEST_PASSWORD;
  const user     = await createUser({ ...opts, password });
  const { accessToken } = await loginUser(user.email, password);
  return { user, accessToken };
}

// ── Request helper ─────────────────────────────────────────────────────────────

/** Returns a supertest Authorization header object for authenticated requests. */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
