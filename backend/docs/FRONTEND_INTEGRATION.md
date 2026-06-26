# Frontend Integration Guide

This guide is written for the Questify Next.js frontend. All examples use the exact request shapes, response envelopes, and endpoint paths that the backend validates and returns.

---

## Table of Contents

1. [API Base URL](#1-api-base-url)
2. [Axios Configuration](#2-axios-configuration)
3. [Authentication Flow](#3-authentication-flow)
4. [TypeScript Types](#4-typescript-types)
5. [Example API Calls](#5-example-api-calls)
6. [Error Handling](#6-error-handling)
7. [React Query Setup](#7-react-query-setup)
8. [Common Issues](#8-common-issues)

---

## 1. API Base URL

```
Development:  http://localhost:8000
Production:   https://<your-railway-or-render-url>
```

All endpoints are prefixed with `/api/v1`.

```typescript
// src/lib/constants.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
```

Add to your Next.js `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

And to your production environment:

```dotenv
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

---

## 2. Axios Configuration

### Install

```bash
npm install axios
```

### Token storage

Store tokens in `localStorage` for persistence across tabs, or `sessionStorage` for single-tab sessions. For higher security, store the access token in memory and the refresh token in an `httpOnly` cookie (requires a proxy route in Next.js).

The examples below use `localStorage`.

### API client

```typescript
// src/lib/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor — attach access token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 3. Authentication Flow

### Important: no public registration

Students and teachers cannot self-register. An **admin** creates user accounts via `POST /api/v1/users` and the API returns a `tempPassword` in the response body. The admin shares this password manually — no email is sent.

On first login with a temp password, `requiresPasswordChange` will be `true`. Redirect those users to a change-password screen immediately.

### Login

```
POST /api/v1/auth/login
```

```typescript
// src/lib/auth.ts
import { api } from "./api";
import type { LoginBody, LoginResponse } from "@/types/api";

export async function login(credentials: LoginBody): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    credentials
  );

  // Persist tokens
  localStorage.setItem("accessToken",  data.data!.accessToken);
  localStorage.setItem("refreshToken", data.data!.refreshToken);

  return data.data!;
}
```

**Request body:**

```json
{
  "email": "alice.johnson@student.edu",
  "password": "StudentPass123!"
}
```

**Response `data`:**

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "requiresPasswordChange": false,
  "user": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "email": "alice.johnson@student.edu",
    "firstName": "Alice",
    "lastName": "Johnson",
    "fullName": "Alice Johnson",
    "role": "student",
    "avatar": null,
    "isActive": true,
    "profile": {
      "bio": "",
      "location": null,
      "phone": null,
      "educationLevel": null,
      "socialLinks": []
    },
    "lastLogin": "2025-09-01T08:00:00.000Z",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### Get current user

```
GET /api/v1/auth/me        Authorization: Bearer <token>
```

```typescript
export async function getMe() {
  const { data } = await api.get<ApiResponse<{ user: User }>>("/auth/me");
  return data.data!.user;
}
```

### Token refresh

There is no `/auth/refresh` endpoint. When the access token expires, the interceptor clears storage and redirects to `/login`. Users re-authenticate to get a new token pair.

If you need silent refresh, implement it via a Next.js API route that proxies the login with stored credentials — or add a `/auth/refresh` endpoint to the backend that verifies the refresh token and issues a new access token.

### Logout

```
POST /api/v1/auth/logout   Authorization: Bearer <token>
```

```typescript
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    // Always clear regardless of network errors
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
}
```

The API is **stateless** — the server does not maintain a session. Calling `/logout` is optional; clearing `localStorage` is what actually logs the user out. If you skip the API call, existing tokens remain technically valid until they expire (7 days by default).

### Change password

```
POST /api/v1/auth/change-password   Authorization: Bearer <token>
```

```typescript
export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await api.post("/auth/change-password", body);
  // After a password change, advise the user to log in again on other devices
}
```

**Request body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

### Update profile

```
PATCH /api/v1/auth/profile   Authorization: Bearer <token>
```

```typescript
export async function updateProfile(body: UpdateProfileBody) {
  const { data } = await api.patch<ApiResponse<{ user: User }>>(
    "/auth/profile",
    body
  );
  return data.data!.user;
}
```

**Request body (all fields optional):**

```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "avatar": "https://example.com/avatar.png",
  "profile": {
    "bio": "Computer Science student",
    "location": "New York",
    "phone": "+1 555 000 0001",
    "educationLevel": "UNDERGRADUATE",
    "socialLinks": ["https://github.com/alice"]
  }
}
```

---

## 4. TypeScript Types

Copy these types into your frontend. They mirror the backend's response shapes exactly.

```typescript
// src/types/api.ts

// ── Response envelope ──────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  pagination?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: string[];
  timestamp: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "teacher" | "student";

export interface LoginBody {
  email: string;
  password: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  profile?: {
    bio?: string;
    location?: string;
    phone?: string;
    educationLevel?: string;
    socialLinks?: string[];
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresPasswordChange: boolean;
  user: User;
}

// ── User ───────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
  profile: {
    bio: string;
    department?: string;
    location: string | null;
    phone: string | null;
    educationLevel: string | null;
    socialLinks: string[];
  };
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Course ─────────────────────────────────────────────────────────────────────
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string | User;
  category: string;
  level: CourseLevel;
  tags: string[];
  thumbnail: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  maxStudents: number | null;
  campus: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseQuery {
  page?: number;
  limit?: number;
  level?: CourseLevel;
  category?: string;
  search?: string;
  campus?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}

// ── Enrollment ─────────────────────────────────────────────────────────────────
export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

export interface Enrollment {
  _id: string;
  studentId: string | User;
  courseId: string | Course;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  totalXpEarned: number;
  progress: number;
  grade: number | null;
  createdAt: string;
  updatedAt: string;
}

// ── Assignment ─────────────────────────────────────────────────────────────────
export type SubmissionType = "FILE" | "TEXT" | "URL" | "MIXED";

export interface Assignment {
  _id: string;
  courseId: string | Course;
  title: string;
  description: string;
  instructions: string;
  submissionType: SubmissionType;
  maxScore: number;
  dueDate: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Submission ─────────────────────────────────────────────────────────────────
export type SubmissionStatus = "PENDING" | "SUBMITTED" | "GRADED" | "LATE";

export interface Submission {
  _id: string;
  assignmentId: string | Assignment;
  studentId: string | User;
  courseId: string | Course;
  content: string;
  fileUrl: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Material ───────────────────────────────────────────────────────────────────
export type MaterialType = "PDF" | "VIDEO" | "DOCUMENT" | "LINK" | "IMAGE" | "CODE";

export interface Material {
  _id: string;
  courseId: string | Course;
  title: string;
  description: string;
  type: MaterialType;
  url: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── XP ─────────────────────────────────────────────────────────────────────────
export type XPActivityType =
  | "ATTENDANCE"
  | "ASSIGNMENT_SUBMISSION"
  | "MATERIAL_READ"
  | "PARTICIPATION"
  | "QUIZ";

export interface XPEvent {
  _id: string;
  studentId: string;
  courseId: string;
  type: XPActivityType;
  points: number;
  earnedAt: string;
  metadata: {
    description: string;
    attendanceId?: string;
    materialId?: string;
    submissionId?: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatar?: string;
  totalXP: number;
}
```

---

## 5. Example API Calls

### Courses

**List published courses (public — no auth)**

```
GET /api/v1/courses
GET /api/v1/courses?level=BEGINNER&category=Computer+Science&page=1&limit=10
GET /api/v1/courses/search?q=python&limit=5
```

```typescript
// src/lib/courses.ts
import { api } from "./api";
import type { ApiResponse, Course, CourseQuery, PaginationMeta } from "@/types/api";

export async function getCourses(query?: CourseQuery) {
  const { data } = await api.get<ApiResponse<{ courses: Course[] }>>(
    "/courses",
    { params: query }
  );
  return {
    courses: data.data!.courses,
    pagination: data.pagination as PaginationMeta,
  };
}

export async function getCourseById(id: string) {
  const { data } = await api.get<ApiResponse<{ course: Course }>>(
    `/courses/${id}`
  );
  return data.data!.course;
}

export async function searchCourses(q: string, limit = 10) {
  const { data } = await api.get<ApiResponse<{ courses: Course[] }>>(
    "/courses/search",
    { params: { q, limit } }
  );
  return data.data!.courses;
}
```

### Enrollments (student only)

**Enrol in a course**

```
POST /api/v1/my-enrollments/enroll   Authorization: Bearer <student_token>
```

```typescript
export async function enrollInCourse(courseId: string) {
  const { data } = await api.post<ApiResponse<{ enrollment: Enrollment }>>(
    "/my-enrollments/enroll",
    { courseId }
  );
  return data.data!.enrollment;
}
```

**List my enrollments**

```
GET /api/v1/my-enrollments?status=ACTIVE&page=1&limit=20
```

```typescript
export async function getMyEnrollments(status?: "ACTIVE" | "COMPLETED" | "DROPPED") {
  const { data } = await api.get<ApiResponse<{ enrollments: Enrollment[] }>>(
    "/my-enrollments",
    { params: { status } }
  );
  return data.data!.enrollments;
}
```

**Get enrollment for a specific course**

```
GET /api/v1/my-enrollments/:courseId   Authorization: Bearer <student_token>
```

```typescript
export async function getMyEnrollmentByCourse(courseId: string) {
  const { data } = await api.get<ApiResponse<{ enrollment: Enrollment }>>(
    `/my-enrollments/${courseId}`
  );
  return data.data!.enrollment;
}
```

**Unenrol**

```
DELETE /api/v1/my-enrollments/:enrollmentId   Authorization: Bearer <student_token>
```

```typescript
export async function unenroll(enrollmentId: string) {
  await api.delete(`/my-enrollments/${enrollmentId}`);
}
```

### Materials

```
GET /api/v1/materials/course/:courseId   Authorization: Bearer <token>
GET /api/v1/materials/:id/view           Authorization: Bearer <student_token>  (awards XP)
```

```typescript
export async function getCourseMaterials(courseId: string) {
  const { data } = await api.get<ApiResponse<{ materials: Material[] }>>(
    `/materials/course/${courseId}`
  );
  return data.data!.materials;
}

// Call this when a student opens a material — awards MATERIAL_READ XP
export async function viewMaterial(materialId: string) {
  const { data } = await api.get<ApiResponse<{ material: Material }>>(
    `/materials/${materialId}/view`
  );
  return data.data!.material;
}
```

### Assignments & Submissions

**Get assignments for a course**

```
GET /api/v1/assignments/course/:courseId   Authorization: Bearer <token>
```

```typescript
export async function getCourseAssignments(courseId: string) {
  const { data } = await api.get<ApiResponse<{ assignments: Assignment[] }>>(
    `/assignments/course/${courseId}`
  );
  return data.data!.assignments;
}
```

**Submit an assignment (student)**

```
POST /api/v1/submissions   Authorization: Bearer <student_token>
```

```typescript
export async function submitAssignment(payload: {
  assignmentId: string;
  content: string;
  fileUrl?: string;
}) {
  const { data } = await api.post<ApiResponse<{ submission: Submission }>>(
    "/submissions",
    payload
  );
  return data.data!.submission;
}
```

**View my submissions (student)**

```
GET /api/v1/submissions/my   Authorization: Bearer <student_token>
```

```typescript
export async function getMySubmissions() {
  const { data } = await api.get<ApiResponse<{ submissions: Submission[] }>>(
    "/submissions/my"
  );
  return data.data!.submissions;
}
```

**Grade a submission (teacher)**

```
PATCH /api/v1/submissions/:id/grade   Authorization: Bearer <teacher_token>
```

```typescript
export async function gradeSubmission(
  submissionId: string,
  payload: { score: number; feedback?: string }
) {
  const { data } = await api.patch<ApiResponse<{ submission: Submission }>>(
    `/submissions/${submissionId}/grade`,
    payload
  );
  return data.data!.submission;
}
```

### User profile

```
GET /api/v1/users/:id/profile   Authorization: Bearer <token>
```

```typescript
export async function getUserProfile(userId: string) {
  const { data } = await api.get<ApiResponse<{ user: User }>>(
    `/users/${userId}/profile`
  );
  return data.data!.user;
}
```

---

## 6. Error Handling

### Error response shape

Every error from the API follows this exact shape:

```typescript
interface ApiError {
  code: string;          // e.g. "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"
  message: string;       // human-readable message
  statusCode: number;    // HTTP status
  details?: string[];    // field-level validation messages
  timestamp: string;
  requestId: string;     // include this when reporting bugs
}
```

### Centralised error handler

```typescript
// src/lib/api-error.ts
import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

export class QuestifyApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: string[];
  public readonly requestId: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "QuestifyApiError";
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details ?? [];
    this.requestId = error.requestId;
  }
}

export function parseApiError(err: unknown): QuestifyApiError {
  const axiosError = err as AxiosError<{ error: ApiError }>;
  const apiError = axiosError.response?.data?.error;

  if (apiError) return new QuestifyApiError(apiError);

  // Network error, timeout, or unexpected shape
  return new QuestifyApiError({
    code: "NETWORK_ERROR",
    message: axiosError.message ?? "An unexpected error occurred",
    statusCode: 0,
    timestamp: new Date().toISOString(),
    requestId: "",
  });
}
```

### Response interceptor with typed errors

Update the interceptor in `api.ts`:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error: ApiError }>) => {
    const status = error.response?.status;

    if (status === 401) {
      // Access token expired or invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = `/login?reason=session_expired`;
      return Promise.reject(error);
    }

    if (status === 403) {
      // Authenticated but lacking the required role
      window.location.href = "/403";
      return Promise.reject(error);
    }

    return Promise.reject(parseApiError(error));
  }
);
```

### Handling validation errors (400/422)

When Zod validation fails, the API returns an array of field-level error messages in `error.details`:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "statusCode": 422,
    "details": [
      "email: must be a valid email address",
      "password: must be at least 8 characters"
    ]
  }
}
```

Map these to form field errors:

```typescript
function extractFieldErrors(err: QuestifyApiError): Record<string, string> {
  return err.details.reduce<Record<string, string>>((acc, detail) => {
    // Format: "fieldName: error message"
    const colonIdx = detail.indexOf(": ");
    if (colonIdx !== -1) {
      const field = detail.slice(0, colonIdx);
      const message = detail.slice(colonIdx + 2);
      acc[field] = message;
    }
    return acc;
  }, {});
}

// Usage with react-hook-form
try {
  await login(formData);
} catch (err) {
  if (err instanceof QuestifyApiError && err.code === "VALIDATION_ERROR") {
    const fieldErrors = extractFieldErrors(err);
    Object.entries(fieldErrors).forEach(([field, message]) => {
      form.setError(field as keyof LoginBody, { message });
    });
  }
}
```

### Error code reference

| Code | Status | Meaning |
|------|--------|---------|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `TOKEN_EXPIRED` | 401 | Access token has expired — re-login |
| `UNAUTHORIZED` | 401 | No token or malformed token |
| `FORBIDDEN` | 403 | Valid token but wrong role |
| `ACCOUNT_DISABLED` | 403 | Account deactivated by admin |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate (e.g. already enrolled) |
| `VALIDATION_ERROR` | 422 | Zod schema rejected the request body |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests — back off and retry |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 7. React Query Setup

### Install

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Provider

```typescript
// src/app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,          // 1 minute
            retry: (count, err) => {
              // Don't retry on auth/validation errors
              if (err instanceof QuestifyApiError) {
                return err.statusCode >= 500 && count < 2;
              }
              return count < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Wrap your root layout:

```typescript
// src/app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Query keys

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  courses: {
    all: (query?: CourseQuery) => ["courses", query] as const,
    byId: (id: string) => ["courses", id] as const,
    search: (q: string) => ["courses", "search", q] as const,
  },
  enrollments: {
    mine: (status?: string) => ["my-enrollments", status] as const,
    byCourse: (courseId: string) => ["my-enrollments", "course", courseId] as const,
  },
  materials: {
    byCourse: (courseId: string) => ["materials", "course", courseId] as const,
  },
  assignments: {
    byCourse: (courseId: string) => ["assignments", "course", courseId] as const,
  },
  submissions: {
    mine: ["submissions", "my"] as const,
    byAssignment: (assignmentId: string) => ["submissions", "assignment", assignmentId] as const,
  },
} as const;
```

### Hooks

```typescript
// src/hooks/use-courses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getCourses, getCourseById } from "@/lib/courses";
import { enrollInCourse, unenroll } from "@/lib/enrollments";

export function useCourses(query?: CourseQuery) {
  return useQuery({
    queryKey: queryKeys.courses.all(query),
    queryFn: () => getCourses(query),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: queryKeys.courses.byId(id),
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollInCourse,
    onSuccess: () => {
      // Invalidate enrollment list so it refetches
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });
}

export function useUnenroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unenroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });
}
```

```typescript
// src/hooks/use-auth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getMe, login, logout, updateProfile } from "@/lib/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
    // Don't run if there's no token
    enabled: !!localStorage.getItem("accessToken"),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser);
    },
  });
}
```

### Pagination

The API returns a `pagination` object on list endpoints. Use `keepPreviousData` to prevent flicker during page transitions:

```typescript
// src/hooks/use-paginated-courses.ts
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCourses } from "@/lib/courses";
import { queryKeys } from "@/lib/query-keys";

export function usePaginatedCourses(pageSize = 10) {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<CourseLevel | undefined>();

  const query = useQuery({
    queryKey: queryKeys.courses.all({ page, limit: pageSize, level }),
    queryFn: () => getCourses({ page, limit: pageSize, level }),
    placeholderData: (prev) => prev,   // keeps previous data visible while loading
  });

  return {
    ...query,
    page,
    setPage,
    level,
    setLevel,
    totalPages: query.data?.pagination?.pages ?? 1,
  };
}
```

---

## 8. Common Issues

### CORS errors in the browser

**Symptom:** `Access-Control-Allow-Origin` missing from the response.

**Cause:** The backend's `ALLOWED_ORIGINS` does not include your frontend URL.

**Fix:** In the backend `.env`, add the exact frontend origin:

```dotenv
# Development
ALLOWED_ORIGINS=http://localhost:3000

# Production — use exact URL, no trailing slash
ALLOWED_ORIGINS=https://questify.vercel.app
```

Restart the backend server after changing env vars.

If your frontend runs on a different port (3001, 5173, etc.), add that port to `ALLOWED_ORIGINS` as a comma-separated value:

```dotenv
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### `401 Unauthorized` on every request

**Cause A:** Token not being sent. Check that the Axios interceptor is wired up and `localStorage.getItem("accessToken")` returns a value.

**Cause B:** Token is expired (7-day default TTL). Clear storage and re-login.

**Cause C:** Wrong `Authorization` header format. Must be exactly `Bearer <token>` with a space — not `bearer`, `Token`, or `JWT`.

```typescript
// Verify the header format
console.log(api.defaults.headers.common["Authorization"]);
// Should print: "Bearer eyJhbGci..."
```

### `403 Forbidden` when calling an endpoint

The user is authenticated but does not have the required role. The error response includes the required role:

```json
{ "error": { "code": "FORBIDDEN", "message": "Access denied. Required role: teacher" } }
```

Role hierarchy:
- `admin` → can do everything
- `teacher` → course management, grading
- `student` → self-enrol, submit, view own data

There is no role escalation via the API — role is set at user creation by an admin.

### `requiresPasswordChange: true` after login

An admin created the account and the user hasn't changed the temp password yet. Redirect immediately after login:

```typescript
const result = await login(credentials);
if (result.requiresPasswordChange) {
  router.push("/change-password?required=true");
} else {
  router.push("/dashboard");
}
```

### Student can't enrol — `403` from `/my-enrollments/enroll`

Only users with `role: "student"` can call this endpoint. Teachers and admins get a `403`. Verify `user.role === "student"` before showing the enrol button.

### `409 Conflict` on enrol

The student is already enrolled (or previously dropped). The error code will be `CONFLICT`. Check the current enrolment status via `GET /api/v1/my-enrollments/:courseId` before attempting to enrol again.

### Paginated requests returning the wrong page

Query params must be numbers, not strings. Axios serialises object params correctly, but if you're building the URL manually, ensure `page` and `limit` are integers:

```typescript
// Correct
params: { page: 1, limit: 10 }

// Wrong — backend coerces with Zod but may reject if schema is strict
params: { page: "1", limit: "10" }
```

### Swagger UI to explore endpoints interactively

When the backend is running locally, open `http://localhost:8000/api-docs` in your browser. You can authorise with a Bearer token and test every endpoint without writing any frontend code:

1. Call `POST /api/v1/auth/login` from the Swagger UI
2. Copy the `accessToken` from the response
3. Click **Authorize** → paste the token → **Authorize**
4. All subsequent requests in the UI will include the token
