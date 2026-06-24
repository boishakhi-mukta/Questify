# Questify — Backend

Node.js / Express / MongoDB REST API powering the Questify gamified LMS.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Express 4.18+ |
| Database | MongoDB via Mongoose 8+ |
| Validation | Zod 3.22+ + express-validator |
| Auth | JSON Web Tokens (jsonwebtoken 9+) |
| Password hashing | bcryptjs |
| Security | helmet, cors, express-rate-limit |
| Logging | morgan |
| Testing | Jest + ts-jest + Supertest |
| Runtime | TypeScript 5 → Node 20 |

## Prerequisites

- Node.js ≥ 20
- MongoDB Atlas cluster (or local mongod)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
#    → open .env and fill in MONGODB_URI, JWT_SECRET, etc.

# 3. Start development server (hot-reload)
npm run dev
```

Server starts at `http://localhost:5000` by default.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | HTTP port (default: 5000) |
| `NODE_ENV` | No | `development` \| `production` |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | HS256 signing secret (≥ 64 chars) |
| `JWT_EXPIRES_IN` | No | Access token TTL (default: 7d) |
| `JWT_REFRESH_SECRET` | **Yes** | Separate secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL (default: 30d) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window in ms (default: 900000) |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |
| `BCRYPT_ROUNDS` | No | bcrypt cost factor (default: 12) |
| `LOG_FORMAT` | No | morgan format: `dev` \| `combined` |

## Scripts

```bash
npm run dev          # nodemon + ts-node hot-reload
npm run build        # tsc → dist/
npm run start        # node dist/server.js (production)
npm run test         # jest (run all tests)
npm run test:watch   # jest --watch
npm run test:coverage # jest with coverage report
npm run lint         # eslint
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # DB connection, env validation
│   ├── controllers/     # Route handler logic
│   ├── middleware/       # auth, errorHandler, validate
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # AppError, asyncHandler, response helpers
│   ├── app.ts           # Express app factory (middleware + routes)
│   └── server.ts        # Entry point — DB connect + listen
├── tests/
│   ├── unit/            # Pure logic tests
│   └── integration/     # Supertest HTTP tests
├── .env.example
├── tsconfig.json
└── package.json
```

## API Conventions

All responses follow the `ApiResponse<T>` envelope:

```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": ["..."] }
```

Paginated responses include a `pagination` key:

```json
{ "success": true, "message": "...", "data": [...], "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 } }
```

## Generating secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.
