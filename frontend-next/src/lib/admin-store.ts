/**
 * Client-side mock store for admin CRUD operations.
 * Swap the arrays and functions below with real API calls when a backend is ready.
 */

import type { UserRole } from "@/types/auth";

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Extract<UserRole, "teacher" | "student">;
  password: string;
}

export interface AdminCourse {
  id: number;
  name: string;
  level: string;
  campus: string;
  credit: number;
  semester: string;
  category: string;
}

// ── Seed data ─────────────────────────────────────────────

export const seedUsers: AdminUser[] = [
  { id: "2", userId: "teacher01", name: "Alice Hansen",   email: "alice@questify.no",  role: "teacher", password: "Teacher@123" },
  { id: "3", userId: "teacher02", name: "Bob Eriksen",    email: "bob@questify.no",    role: "teacher", password: "Teacher@123" },
  { id: "4", userId: "student01", name: "Clara Andersen", email: "clara@questify.no",  role: "student", password: "Student@123" },
  { id: "5", userId: "student02", name: "David Nilsen",   email: "david@questify.no",  role: "student", password: "Student@123" },
];

export const seedCourses: AdminCourse[] = [
  { id: 1, name: "Introduction to Web Development",  level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "Technology" },
  { id: 2, name: "Data Structures and Algorithms",   level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "CS" },
  { id: 3, name: "Human-Computer Interaction",       level: "Master",   campus: "Halden", credit: 10, semester: "Fall 2025",   category: "Design" },
  { id: 4, name: "Machine Learning Fundamentals",    level: "Master",   campus: "Halden", credit: 10, semester: "Spring 2025", category: "AI" },
  { id: 5, name: "Cloud Computing with Azure",       level: "Bachelor", campus: "Halden", credit: 10, semester: "Fall 2025",   category: "Cloud" },
  { id: 6, name: "Software Quality Assurance",       level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "Testing" },
];

// ── Helpers ───────────────────────────────────────────────

export function nextUserId(users: AdminUser[]): string {
  const max = users.reduce((m, u) => Math.max(m, Number(u.id)), 0);
  return String(max + 1);
}

export function nextCourseId(courses: AdminCourse[]): number {
  return courses.reduce((m, c) => Math.max(m, c.id), 0) + 1;
}
