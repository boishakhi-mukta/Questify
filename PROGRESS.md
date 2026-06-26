# Questify — Build Progress Tracker

> Last updated: 2026-06-26
> Branch: `feat/nextjs-migration`

---

## Legend
- ✅ Done
- 🔄 Partial / in progress
- ⬜ Not started

---

## Backend (`backend/`)

### Infrastructure & Config
| Status | Item |
|--------|------|
| ✅ | Express + TypeScript project setup |
| ✅ | MongoDB + Mongoose connection (`config/database.ts`, `config/db.ts`) |
| ✅ | Environment validation (`config/environment.ts`) |
| ✅ | Winston structured logger (`utils/logger.ts`) — dev pretty / prod JSON, daily rotating files |
| ✅ | Morgan HTTP logging streamed to Winston |
| ✅ | Request monitoring middleware + in-process p95/avg/error metrics (`middleware/monitoring.ts`) |
| ✅ | Deep health check endpoint `GET /health` (MongoDB ping + metrics + uptime) |
| ✅ | Rate limiter middleware (`middleware/rateLimiter.ts`) |
| ✅ | RBAC middleware (`middleware/rbac.ts`) |
| ✅ | Request ID middleware (`middleware/requestId.ts`) |
| ✅ | Global error handler (`middleware/errorHandler.ts`) — structured logger, 4xx warn / 5xx error |
| ✅ | JWT utilities (`utils/jwt.ts`) |
| ✅ | Password hashing (`utils/password.ts`) |
| ✅ | Encryption utilities (`utils/encryption.ts`) |
| ✅ | AppError class + async handler (`utils/AppError.ts`, `utils/asyncHandler.ts`) |
| ✅ | Response helpers (`utils/response.ts`, `utils/responses.ts`) |
| ✅ | Validators (`utils/validators.ts`) |
| ✅ | Clerk admin SDK helper (`utils/clerk-admin.ts`) |
| ✅ | OpenAPI/Swagger docs (`docs/openapi.ts`) |
| ✅ | Testing infrastructure — setup, teardown, helpers (`tests/`) |

### Data Models
| Status | Model |
|--------|-------|
| ✅ | `User` — role (admin/teacher/student), Clerk ID, XP |
| ✅ | `Course` — title, category, level, semester, campus, instructor |
| ✅ | `Enrollment` — student ↔ course link |
| ✅ | `Assignment` — prompts, deadlines, course reference |
| ✅ | `Submission` — student work, grade, feedback |
| ✅ | `Material` — PDF / video uploads per course |
| ✅ | `Attendance` — per-class presence records |
| ✅ | `XP` — event log (attendance +10, assignment +25, material +15) |
| ✅ | `Department` |

### API Routes & Controllers
| Status | Route | Controller |
|--------|-------|------------|
| ✅ | `POST /auth/login` | `auth.controller.ts` |
| ✅ | `POST /auth/logout` | `auth.controller.ts` |
| ✅ | `POST /auth/change-password` | `auth.controller.ts` |
| ✅ | `GET/POST /admin/users` | `admin.controller.ts` |
| ✅ | `PATCH/DELETE /admin/users/:id` | `admin.controller.ts` |
| ✅ | `POST /admin/users/:id/reset-password` | `admin.controller.ts` — returns `tempPassword`, **no email sent** |
| ✅ | `GET/POST /courses` | `course.controller.ts` |
| ✅ | `GET/PATCH/DELETE /courses/:id` | `course.controller.ts` |
| ✅ | `GET /enrollments`, `POST /enrollments` | `enrollment.controller.ts` — student self-enroll only |
| ✅ | `GET /my-enrollments` | `enrollment.controller.ts` |
| ✅ | `GET/POST /materials` | `material.controller.ts` |
| ✅ | `GET/POST /assignments` | `assignment.controller.ts` |
| ✅ | `GET/POST /submissions` | `submission.controller.ts` |
| ✅ | `GET /users` + `GET /users/:id` | `user.controller.ts` |
| ✅ | `GET /analytics/*` | `analytics.controller.ts` |

### Seed System
| Status | Seeder |
|--------|--------|
| ✅ | `seeds/seed.ts` — master runner |
| ✅ | Users seeder (admin + teachers + students) |
| ✅ | Courses seeder |
| ✅ | Departments seeder |
| ✅ | Enrollments seeder |
| ✅ | Materials seeder |
| ✅ | Assignments seeder |
| ✅ | Attendance seeder |
| ✅ | XP seeder |

### Key Constraints (must not change)
- **No email notifications** anywhere — enrollment, admin actions, password reset are all silent
- Admin create/reset-password → `tempPassword` returned in response body only
- Admin enrollment management UI intentionally absent — students self-enroll

---

## Frontend (`frontend-next/`)

### Foundation
| Status | Item |
|--------|------|
| ✅ | Next.js 15 App Router + TypeScript |
| ✅ | Tailwind CSS v4 (`@import "tailwindcss"`, `@theme` tokens) |
| ✅ | Dark mode — `next-themes` (class-based) + `@custom-variant dark (&:where(.dark, .dark *))` |
| ✅ | `Providers` wrapper (`ThemeProvider` + `AuthProvider`) with `suppressHydrationWarning` |
| ✅ | shadcn/ui primitives — `button`, `badge`, `card`, `dialog`, `input`, `label`, `select`, `accordion` |
| ✅ | Radix UI Select (`@radix-ui/react-select`) |
| ✅ | Cookie-based JWT auth (migrated away from NextAuth / Clerk) |
| ✅ | Middleware route protection (`src/middleware.ts`) — public vs protected prefixes |
| ✅ | `AuthContext` + `useAuth` hook — user state, login, logout, role |

### Public Pages
| Status | Route | Notes |
|--------|-------|-------|
| ✅ | `/` | Hero, Features, Statistics, Testimonials, HowItWorks, Courses sections |
| ✅ | `/courses` | Full filter/sort/paginate — see Courses section below |
| ✅ | `/courses/[id]` | Course detail page |
| ✅ | `/about` | Hero, stats bar, mission, values grid (6), team cards (4), CTA |
| ✅ | `/contact` | Contact info + validated form (name, email, subject, message), success state |
| ✅ | `/help` | Searchable FAQ accordion — 5 categories × 4 questions, category sidebar, CTA band |

### Auth Pages
| Status | Route | Notes |
|--------|-------|-------|
| ✅ | `/login` (→ `/(auth)/login`) | Login form, demo login buttons |
| ✅ | `/forgot-password` | Password reset request form |
| ✅ | `/change-password` | Force-change modal + strength meter |
| ✅ | `/signin` | Redirect / alias |
| ✅ | `/auth/login`, `/auth/register` | Legacy redirects |

### Dashboard Pages
| Status | Route | Notes |
|--------|-------|-------|
| ✅ | `/admin` | Admin dashboard — stats, user management overview |
| ✅ | `/admin/users` | User list + create user |
| ✅ | `/admin/courses` | Course list + management |
| ✅ | `/student` | Student dashboard |
| ✅ | `/teacher` | Teacher dashboard |
| ✅ | `/dashboard` | Generic redirect based on role |
| ✅ | `/demo/admin` | Admin demo with Layout + demo user |
| ✅ | `/demo/student` | Student demo |
| ✅ | `/demo/teacher` | Teacher demo |
| ⬜ | `/student/courses` | My enrolled courses |
| ⬜ | `/student/leaderboard` | XP leaderboard |
| ⬜ | `/student/profile` | Profile page |
| ⬜ | `/student/settings` | Settings page |
| ⬜ | `/student/help` | In-app help |
| ⬜ | `/teacher/courses` | My courses |
| ⬜ | `/teacher/materials` | Materials management |
| ⬜ | `/teacher/assignments` | Assignments management |
| ⬜ | `/teacher/attendance` | Attendance recording |
| ⬜ | `/teacher/analytics` | Class analytics |
| ⬜ | `/teacher/profile` | Profile page |
| ⬜ | `/teacher/settings` | Settings page |
| ⬜ | `/admin/analytics` | Analytics dashboard |
| ⬜ | `/admin/reports` | Reports |
| ⬜ | `/admin/profile` | Profile page |
| ⬜ | `/admin/settings` | Settings page |

### Navbar & Layout System
| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | `PublicNavbar` (`components/navbar/PublicNavbar.tsx`) | Sticky, auth-aware, mobile drawer, active link highlight |
| ✅ | `AuthenticatedNavbar` (`components/navbar/AuthenticatedNavbar.tsx`) | Top bar, skip-to-content, hamburger toggle |
| ✅ | `UserDropdown` (`components/navbar/UserDropdown.tsx`) | Click-outside + Escape close, ARIA menu |
| ✅ | `Sidebar` (`components/layout/Sidebar.tsx`) | Role-based nav (admin 7 / teacher 8 / student 6 items), mobile overlay, desktop sticky |
| ✅ | `Layout` (`components/layout/Layout.tsx`) | Replaces `DashboardShell` — sidebar + navbar + main |
| ✅ | `DashboardShell` | Legacy — kept for backward compat |
| ✅ | `ThemeToggle` (`components/theme/ThemeToggle.tsx`) | Sun/Moon, skeleton until mounted |
| ✅ | `Footer` (`components/layout/Footer.tsx`) | 5-column grid, newsletter form, social icons |
| ✅ | `Navbar.tsx` (root) | Re-exports `PublicNavbar` for backward compat |

### Courses Feature
| Status | Item | Notes |
|--------|------|-------|
| ✅ | `CourseCard` | Card UI with level, category, instructor, enroll CTA |
| ✅ | `CourseSkeleton` | Loading placeholder |
| ✅ | `SearchBar` | Debounced search input |
| ✅ | `FilterSidebar` | Category, level, semester, campus filters |
| ✅ | `FilterChips` | Active filter chips with remove, `rightSlot` prop for sort dropdown |
| ✅ | `SortDropdown` | Radix Select — 7 options (newest, popular, rating, A→Z, Z→A, price↑, price↓) |
| ✅ | `Pagination` | Page pills + ellipsis, prev/next, jump-to-page, page size selector (12/24/48), mobile simplified |
| ✅ | `CoursesPageClient` | Full pipeline: filter → sort → paginate; URL-driven state; localStorage persistence; smooth scroll on page change |

### Hooks
| Status | Hook | Purpose |
|--------|------|---------|
| ✅ | `useAuth` | Auth state, login, logout, role |
| ✅ | `useSort` | Sort key state + localStorage + URL sync |
| ✅ | `usePagination` | Page, pageSize, totalPages, goToPage, range |
| ✅ | `useFilter` | Active filter state |
| ✅ | `useSearch` | Debounced search query |
| ✅ | `useActiveLink` | Pathname-based active link detection (exact or prefix) |
| ✅ | `useAdminStats` | Fetch admin dashboard stats |
| ✅ | `useChangePassword` | Change password flow |
| ✅ | `useUserRole` | Current user role |
| ✅ | `useTestimonials` | Testimonial data |

### Landing Page Sections
| Status | Section |
|--------|---------|
| ✅ | `HeroBanner` — headline, CTA, Lottie animation |
| ✅ | `FeaturesSection` — XP, progress, leaderboard feature cards |
| ✅ | `StatisticsSection` — counters |
| ✅ | `TestimonialsSection` — student testimonials |
| ✅ | `HowItWorks` — step-by-step visual (kept on homepage, removed from navbar) |
| ✅ | `CoursesSection` — course preview on homepage |

### Auth Components
| Status | Component |
|--------|-----------|
| ✅ | `DemoLoginButtons` — one-click demo login for all 3 roles |
| ✅ | `ForcePasswordChangeModal` — shown on first login |
| ✅ | `PasswordStrengthMeter` |

---

## What's Next (Priority Order)

### High Priority
1. ⬜ **Live backend integration** — connect frontend API calls (`lib/api.ts`) to the real Express endpoints instead of mock data
2. ⬜ **Student: My Courses** (`/student/courses`) — list enrolled courses, progress per course
3. ⬜ **Student: Leaderboard** (`/student/leaderboard`) — XP rankings, filter by course
4. ⬜ **Assignment submission flow** — student submits work, teacher grades it, XP awarded on grade
5. ⬜ **XP display** — show earned XP on student dashboard, animate on award

### Medium Priority
6. ⬜ **Teacher: Attendance** (`/teacher/attendance`) — mark students present/absent, XP auto-award
7. ⬜ **Teacher: Materials upload** (`/teacher/materials`) — PDF/video upload to course
8. ⬜ **Teacher: Assignments** (`/teacher/assignments`) — create, edit, deadline management
9. ⬜ **Profile pages** — avatar upload, bio, display name (student, teacher, admin)
10. ⬜ **Settings pages** — password change, notification prefs, theme (all 3 roles)

### Lower Priority
11. ⬜ **Admin: Analytics** — platform-wide user/course/XP charts
12. ⬜ **Admin: Reports** — exportable data (CSV/PDF)
13. ⬜ **Teacher: Analytics** — per-class progress breakdown
14. ⬜ **Pricing page** (`/pricing`)
15. ⬜ **Real newsletter signup** — wire `Footer` newsletter form to an API endpoint
16. ⬜ **Contact form backend** — store or forward messages from `/contact`
17. ⬜ **E2E tests** — Playwright or Cypress for critical flows (login, enroll, submit)

---

## Architecture Notes

### Auth Flow
- Login → Express issues JWT → stored in `questify_token` cookie + `questify_role` cookie
- Middleware reads cookies to protect routes server-side
- `AuthContext` reads cookies client-side for UI state
- First login with temp password → `ForcePasswordChangeModal` triggers

### XP Rules (backend enforced)
| Action | Points |
|--------|--------|
| Attendance marked present | +10 XP |
| Assignment submitted on time | +25 XP |
| Course material read | +15 XP |

### Role Permissions
| Action | Admin | Teacher | Student |
|--------|-------|---------|---------|
| Create users | ✅ | ❌ | ❌ |
| Manage courses | ✅ | ✅ (own) | ❌ |
| Upload materials | ✅ | ✅ | ❌ |
| Create assignments | ✅ | ✅ | ❌ |
| Submit assignments | ❌ | ❌ | ✅ |
| Self-enroll in courses | ❌ | ❌ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ |
| Mark attendance | ✅ | ✅ | ❌ |
