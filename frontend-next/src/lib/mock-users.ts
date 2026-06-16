/**
 * Mock user store — replace with a real database query in production.
 *
 * Development credentials:
 *   admin001  / Admin@123    (role: admin)
 *   teacher01 / Teacher@123  (role: teacher)
 *   teacher02 / Teacher@123  (role: teacher)
 *   student01 / Student@123  (role: student)
 *   student02 / Student@123  (role: student)
 */

import type { UserRole } from "./auth";

export interface MockUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  /** Plain-text password — for dev mock only. Use hashed passwords with a real DB. */
  password: string;
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    userId: "admin001",
    name: "Admin User",
    email: "admin@questify.no",
    role: "admin",
    password: "Admin@123",
  },
  {
    id: "2",
    userId: "teacher01",
    name: "Alice Hansen",
    email: "alice@questify.no",
    role: "teacher",
    password: "Teacher@123",
  },
  {
    id: "3",
    userId: "teacher02",
    name: "Bob Eriksen",
    email: "bob@questify.no",
    role: "teacher",
    password: "Teacher@123",
  },
  {
    id: "4",
    userId: "student01",
    name: "Clara Andersen",
    email: "clara@questify.no",
    role: "student",
    password: "Student@123",
  },
  {
    id: "5",
    userId: "student02",
    name: "David Nilsen",
    email: "david@questify.no",
    role: "student",
    password: "Student@123",
  },
];
