# Questify Backend

> REST API for **Questify** — a gamified Learning Management System that awards XP points, tracks attendance, and builds leaderboards to keep students engaged.

Built with **Node.js · Express · TypeScript · MongoDB**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Prerequisites](#4-prerequisites)
5. [Installation](#5-installation)
6. [Environment Variables](#6-environment-variables)
7. [Database Setup](#7-database-setup)
8. [Running the Application](#8-running-the-application)
9. [API Documentation](#9-api-documentation)
10. [Testing](#10-testing)
11. [Seeding](#11-seeding)
12. [Contributing](#12-contributing)
13. [Deployment](#13-deployment)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Project Overview

Questify is a gamified LMS where:

- **Students** self-enrol in courses, submit assignments, and earn XP for attendance, material reads, quizzes, and graded submissions.
- **Teachers** manage materials, assignments, grade submissions, and view per-course analytics.
- **Admins** have full CRUD over users, courses, departments, and access to platform-wide reports and dashboards.

This repository is the **backend API only**. The Next.js frontend lives in `../frontend-next/`.

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | Express 4 + `express-async-errors` |
| Language | TypeScript 5 (strict mode) |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (access + refresh tokens) — `jsonwebtoken` |
| Validation | Zod 3 (centralised in `src/utils/validators.ts`) |
| Hashing | bcryptjs |
| Rate limiting | `express-rate-limit` |
| Security headers | Helmet |
| API Docs | Swagger UI (`swagger-ui-express`) |
| Testing | Jest + ts-jest + Supertest |
| Linting | ESLint |
| Dev server | Nodemon + ts-node |

---

## 3. Architecture

### Folder structure

```
backend/
├── src/
│   ├── config/          # Environment parsing (Zod), DB connection, constants
│   ├── controllers/     # Route handler logic (thin — delegates to models/utils)
│   ├── docs/            # OpenAPI 3.0.3 spec (openapi.ts)
│   ├── middleware/      # auth, rbac, validation, rateLimiter, errorHandler, requestId
│   ├── models/          # Mongoose schemas: User, Course, Enrollment, Assignment,
│   │                    #   Material, Submission, XP, Attendance, Department
│   ├── routes/          # Express routers — one file per resource group
│   ├── seeds/           # Database seed orchestrator + individual seeders
│   │   └── seeders/     # departments, users, courses, enrollments, materials,
│   │                    #   assignments, attendance, xp
│   ├── tests/           # Shared test helpers (setup, teardown, helpers)
│   ├── types/           # Shared TypeScript types and augmented Express Request
│   ├── utils/           # errors, jwt, encryption, validators (Zod schemas)
│   ├── app.ts           # Express app factory (middleware + route mounting)
│   └── server.ts        # HTTP server entry point
├── tests/
│   ├── env.ts           # Jest env var injection (setupFiles)
│   ├── unit/            # Unit tests (validators, jwt, encryption, middleware)
│   └── integration/     # Integration tests (auth, courses, enrollments)
├── jest.config.js
├── nodemon.json
├── tsconfig.json
└── package.json
```

### Request lifecycle

```
Client
  │
  ▼
attachRequestId        → stamps X-Request-ID header and res.locals.requestId
  │
  ▼
Swagger UI (/api-docs) → served before Helmet (no CSP conflicts)
  │
  ▼
Helmet                 → security headers
  │
  ▼
CORS · Morgan · Body parsers · Rate limiter
  │
  ▼
Router                 → verifyJWT → requireRole → validateBody/Params/Query
  │
  ▼
Controller             → Mongoose model
  │
  ▼
errorHandler           → standardised { success, error: { code, message, statusCode, requestId } }
```

### XP chain

```
Attendance.save (present=true)
  └─▶ XP.create({ type: "ATTENDANCE", points: 10 })

Submission.save (status → "GRADED")
  └─▶ XP.create({ type: "ASSIGNMENT_SUBMISSION", points: 25 })

Material GET /:id/view
  └─▶ XP.create({ type: "MATERIAL_READ", points: 15 })
```

### Role-based access

| Role | Permissions |
|------|------------|
| `student` | Self-enrol, submit assignments, view own submissions & analytics, read materials |
| `teacher` | Create/edit materials & assignments for own courses, grade submissions, view course analytics |
| `admin` | Everything — user CRUD, course CRUD, department management, reports, dashboard |

---

## 4. Prerequisites

| Requirement | Minimum version | Notes |
|-------------|----------------|-------|
| Node.js | 20 LTS | `node --version` |
| npm | 10+ | bundled with Node 20 |
| MongoDB Atlas | — | Free M0 cluster is sufficient for development |
| Clerk (optional) | — | Required only for Clerk user-sync features |

> **MongoDB Atlas** — create a free account at cloud.mongodb.com. A shared M0 cluster is free forever and sufficient for development and staging.

> **Clerk** — the API can run without Clerk. Set `CLERK_SECRET_KEY=""` in `.env` to disable Clerk sync. Admin-created users receive a `tempPassword` in the response body for manual sharing — no email is sent.

---

## 5. Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/questify.git
cd questify/backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then edit .env with your values (see section 6)

# 4. Start the development server
npm run dev
```

The server starts on **http://localhost:8000** by default.

---

## 6. Environment Variables

Copy `.env.example` to `.env` and fill in each value:

```bash
cp .env.example .env
```

### `.env.example`

```dotenv
# ── Server ─────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=8000

# ── MongoDB ────────────────────────────────────────────────────────────────────
# Get from: MongoDB Atlas → Connect → Drivers → copy connection string
# Replace <username>, <password>, and <dbname>
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/questify?retryWrites=true&w=majority

# ── JWT ────────────────────────────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=replace_with_64_char_random_hex_string_minimum_32_chars
JWT_EXPIRES_IN=7d

JWT_REFRESH_SECRET=replace_with_different_64_char_random_hex_string
JWT_REFRESH_EXPIRES_IN=30d

# ── CORS ───────────────────────────────────────────────────────────────────────
# Comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:3000

# ── Rate limiting ──────────────────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes in milliseconds
RATE_LIMIT_MAX=100            # max requests per window per IP

# ── Bcrypt ─────────────────────────────────────────────────────────────────────
# 10–15; higher = more secure but slower. 12 is a good production default.
BCRYPT_ROUNDS=12

# ── Logging ────────────────────────────────────────────────────────────────────
# Morgan log format: combined | dev | short | tiny
LOG_FORMAT=dev

# ── App URL ────────────────────────────────────────────────────────────────────
APP_URL=http://localhost:3000

# ── Email / SMTP (optional) ───────────────────────────────────────────────────
# Leave blank in development — email is NOT used for any auth or enrolment flow.
# Required only if you add notification features in the future.
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@questify.app

# ── Clerk (optional) ──────────────────────────────────────────────────────────
# Get from: Clerk Dashboard → API Keys → Secret key
# Leave empty to disable Clerk sync (admin-created users get a tempPassword instead)
CLERK_SECRET_KEY=

# ── API Docs (production only) ────────────────────────────────────────────────
# Set to "true" to enable Swagger UI in production (default: off in production)
ENABLE_DOCS=false
```

### Variable reference

| Variable | Required | Default | How to get it |
|----------|----------|---------|--------------|
| `NODE_ENV` | Yes | `development` | Set manually |
| `PORT` | No | `8000` | Set manually |
| `MONGODB_URI` | Yes | — | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Yes | — | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | No | `7d` | Duration string (e.g. `1h`, `7d`) |
| `JWT_REFRESH_SECRET` | Yes | — | Same command as above, run again for a different value |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Duration string |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated frontend URLs |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Milliseconds |
| `RATE_LIMIT_MAX` | No | `100` | Integer |
| `BCRYPT_ROUNDS` | No | `12` | Integer 10–15 |
| `LOG_FORMAT` | No | `dev` | `combined` \| `dev` \| `short` \| `tiny` |
| `APP_URL` | No | `http://localhost:3000` | Your frontend URL |
| `CLERK_SECRET_KEY` | No | — | Clerk Dashboard → API Keys |
| `ENABLE_DOCS` | No | `false` | `true` to enable Swagger in production |

---

## 7. Database Setup

### Create a MongoDB Atlas cluster

1. Sign in at cloud.mongodb.com
2. Create a **new project** → **Build a Database** → choose **M0 Free**
3. Create a **database user** with a strong password
4. Under **Network Access** → add your IP address (or `0.0.0.0/0` for development)
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<password>` and append the database name: `.../questify?retryWrites=true&w=majority`

### Seed the database

After starting the server at least once (Mongoose creates indexes automatically), seed with realistic data:

```bash
# Full seed — 2 admins, 6 faculty, 20 students, 10 courses, enrollments, materials, etc.
npm run seed

# Wipe everything and re-seed from scratch
npm run seed:reset

# Demo users + 2 demo courses only (great for stakeholder demos)
npm run seed:demo

# Admin users only
npm run seed:admin
```

Seed credentials after `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@university.edu` | `AdminPass123!` |
| Admin | `registrar@university.edu` | `RegPass123!` |
| Teacher | `s.chen@university.edu` | `FacultyPass123!` |
| Student | `alice.johnson@student.edu` | `StudentPass123!` |
| Demo admin | `admin@demo.com` | `DemoPass123!` |
| Demo teacher | `faculty@demo.com` | `DemoPass123!` |
| Demo student | `student@demo.com` | `DemoPass123!` |

> The seed scripts never send emails. Admin-created users receive a `tempPassword` in the API response body only.

### Test database

For integration tests, use a separate Atlas cluster or a local MongoDB instance:

```bash
# Local MongoDB (if installed)
mongod --dbpath /tmp/questify-test

# Or export before running tests
export MONGODB_URI=mongodb://127.0.0.1:27017/questify_test
npm run test:integration
```

---

## 8. Running the Application

### Development

```bash
npm run dev
```

Nodemon watches `src/` and restarts on `.ts` or `.json` changes.

### Production build

```bash
# Compile TypeScript → dist/
npm run build

# Start the compiled server
npm start
```

### All scripts

```bash
npm run dev              # nodemon + ts-node hot-reload
npm run build            # tsc → dist/
npm start                # node dist/server.js (production)
npm run lint             # ESLint — check for type/style issues
npm test                 # all tests + coverage report
npm run test:unit        # unit tests only (no DB required)
npm run test:integration # integration tests (requires MongoDB)
npm run test:watch       # watch mode for TDD
npm run test:coverage    # same as npm test — generates coverage/
npm run seed             # full database seed
npm run seed:demo        # demo data only
npm run seed:reset       # wipe all data then full seed
npm run seed:admin       # admin users only
```

---

## 9. API Documentation

### Interactive Swagger UI

Start the dev server, then open:

```
http://localhost:8000/api-docs
```

### Raw OpenAPI JSON

Import into Postman, Insomnia, or any OpenAPI-compatible tool:

```
http://localhost:8000/api-docs.json
```

### Authentication flow

```bash
# 1. Log in — receive access + refresh tokens
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@university.edu", "password": "AdminPass123!" }'

# Response:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJhbGci...",
#     "refreshToken": "eyJhbGci...",
#     "expiresIn": "7d"
#   }
# }

# 2. Use the access token in subsequent requests
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGci..."
```

### Example requests

**List published courses (public)**
```bash
curl "http://localhost:8000/api/v1/courses?level=BEGINNER&limit=5"
```

**Self-enrol in a course (student)**
```bash
curl -X POST http://localhost:8000/api/v1/my-enrollments/enroll \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{ "courseId": "665f1a2b3c4d5e6f7a8b9c0d" }'
```

**Grade a submission (teacher)**
```bash
curl -X PATCH http://localhost:8000/api/v1/submissions/<submissionId>/grade \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{ "score": 88, "feedback": "Excellent work on the architecture section." }'
```

**Get course analytics (teacher/admin)**
```bash
curl http://localhost:8000/api/v1/analytics/course/<courseId> \
  -H "Authorization: Bearer <teacher_token>"
```

### API response envelope

Every response follows the same shape:

```json
{ "success": true, "message": "...", "data": { } }
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "statusCode": 422,
    "details": ["email: must be a valid email address"],
    "timestamp": "2025-09-01T08:00:00.000Z",
    "requestId": "req_1a2b3c4d"
  }
}
```

Paginated responses include a `pagination` key:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

---

## 10. Testing

### Run all tests

```bash
npm test
```

### Targeted runs

```bash
npm run test:unit         # unit tests only (no DB required)
npm run test:integration  # integration tests (requires MongoDB)
npm run test:watch        # watch mode for TDD
npm run test:coverage     # generates coverage/ report
```

### Test structure

```
tests/
├── env.ts               # Sets process.env before any module import (Jest setupFiles)
├── unit/
│   ├── AppError.test.ts     # Custom error classes
│   ├── middleware.test.ts   # verifyJWT, requireRole, validateRequest
│   ├── jwt.test.ts          # Token generation and verification
│   ├── encryption.test.ts   # bcrypt hash + compare
│   └── validators.test.ts   # All Zod schemas
└── integration/
    ├── auth.test.ts         # Login, logout, change-password flow
    ├── courses.test.ts      # Course CRUD with auth
    └── enrollment.test.ts   # Enrolment, unenrolment, access control
```

### Coverage thresholds

The project enforces **70%** coverage on branches, functions, lines, and statements. Falling below this threshold fails the build.

---

## 11. Seeding

The seed system is modular — each resource has its own seeder in `src/seeds/seeders/`:

| Seeder | What it creates |
|--------|----------------|
| `departments.ts` | 5 departments (CS, BUS, DST, MATH, ISEC) |
| `users.ts` | 2 admins, 6 faculty, 20 students, 3 demo users |
| `courses.ts` | 10 courses across 4 subject areas |
| `enrollments.ts` | ~44 enrolments with ACTIVE/COMPLETED/DROPPED mix |
| `materials.ts` | 2–4 materials per course (PDF, VIDEO, DOCUMENT, LINK, CODE) |
| `assignments.ts` | 2–3 assignments per course with full instructions |
| `attendance.ts` | 8 sessions per enrolment at ~85% attendance rate |
| `xp.ts` | 3–12 XP events per active enrolment |

All seed operations are **idempotent** — running the same command twice skips existing records. All seed operations **never send emails**.

> **Production safety:** When `NODE_ENV=production`, the seed script requires you to type `SEED` at the prompt before proceeding.

---

## 12. Contributing

### Code style

- **TypeScript strict mode** enforced — `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- No comments unless the *why* is non-obvious (hidden constraint, workaround, subtle invariant)
- All Zod schemas centralised in `src/utils/validators.ts` — no inline schemas in controllers or routes
- No emails — admin operations (create user, reset password) return credentials in the response body; no SMTP calls

### Adding a new endpoint

1. Add the Zod schema(s) to `src/utils/validators.ts`
2. Add the controller function to the appropriate `src/controllers/*.controller.ts`
3. Add the route to `src/routes/<resource>.ts`
4. Add the path to `src/docs/openapi.ts`
5. Write unit + integration tests

### Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add XP leaderboard endpoint
fix: prevent double-awarding attendance XP on update
docs: update OpenAPI spec for analytics routes
test: add integration tests for self-unenrolment
refactor: centralise pagination logic in query helpers
```

### Pull request checklist

- [ ] `npm run lint` passes with no errors
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run test:unit` passes
- [ ] New endpoint documented in `src/docs/openapi.ts`
- [ ] No hardcoded credentials or secrets committed

---

## 13. Deployment

### Environment checklist for production

```dotenv
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://...          # Atlas production cluster
JWT_SECRET=<64-char random hex>
JWT_REFRESH_SECRET=<different 64-char random hex>
ALLOWED_ORIGINS=https://questify.app  # your frontend domain
BCRYPT_ROUNDS=12
LOG_FORMAT=combined
ENABLE_DOCS=false
```

> Never set `ENABLE_DOCS=true` in production unless behind authentication.

### Build

```bash
npm run build    # compiles TypeScript → dist/
npm start        # runs dist/server.js
```

### Railway

1. Connect your GitHub repository
2. Set all environment variables under **Variables → Raw editor**
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`

Railway injects `PORT` automatically.

### Render

1. Create a **Web Service** → connect your repo
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. Add all environment variables under **Environment**
5. Set **Health Check Path** to `/health`

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t questify-backend .
docker run -p 8000:8000 --env-file .env questify-backend
```

---

## 14. Troubleshooting

### `MongoServerError: bad auth` / connection refused

Wrong credentials or IP not whitelisted.

```bash
# Verify Atlas IP access list includes your current IP
# Atlas Dashboard → Network Access → Add IP Address
```

### `Invalid environment variables` on startup

A required env var is missing or malformed. The startup error lists which ones. Ensure `.env` exists and all required variables are set.

### `JWT_SECRET must be at least 32 characters`

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.

### Swagger UI shows a blank page

The API docs are served before Helmet intentionally. If you see CSP errors in the browser console, verify you're accessing `/api-docs` directly from the server host (no proxy stripping headers).

### `E11000 duplicate key error` in seeds

A partial seed run left conflicting data.

```bash
npm run seed:reset    # wipe everything and re-seed cleanly
```

### `npm run test:integration` hangs

No MongoDB instance is reachable.

```bash
# Start local MongoDB
mongod --dbpath /tmp/questify-test --port 27017

# Or point to Atlas
MONGODB_URI=mongodb+srv://... npm run test:integration
```

### Port 8000 already in use

```bash
lsof -ti:8000 | xargs kill -9
# or use a different port
PORT=8001 npm run dev
```
